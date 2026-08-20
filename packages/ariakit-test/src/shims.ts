// oxlint-disable unbound-method
import {
  isFocusable as isElementFocusable,
  isVisible as isElementVisible,
  noop,
} from "@ariakit/utils";
import type { OwnerWindowSource } from "./__utils.ts";
import { getOwnerWindow, isBrowser, isHappyDOM } from "./__utils.ts";

// Apply shims at import because components read layout and focusability between
// interactions. Frame realms stay unshimmed until a helper first receives one
// of their nodes. Both public DOM entry points load this side effect.
// https://github.com/ariakit/ariakit/pull/6256#discussion_r3366022385
// https://github.com/ariakit/ariakit/pull/7219#discussion_r3819765577

// Key by the prototype because happy-dom frames share their parent's classes;
// keying by window would wrap the same methods again for every frame.
// https://github.com/ariakit/ariakit/issues/7200
const appliedBrowserShims = new WeakMap<object, () => void>();

function applyBrowserShims(
  targetWindow:
    | (Window & typeof globalThis)
    | null
    | undefined = typeof window === "undefined" ? undefined : window,
) {
  if (isBrowser) return noop;
  // Importing `@ariakit/test` in plain Node must remain a no-op.
  if (
    !targetWindow ||
    typeof targetWindow.HTMLElement === "undefined" ||
    typeof targetWindow.Element === "undefined"
  ) {
    return noop;
  }

  const { Element: ElementConstructor } = targetWindow;
  const { HTMLElement: HTMLElementConstructor } = targetWindow;
  polyfillClipboardEvent(targetWindow);
  const existingRestore = appliedBrowserShims.get(ElementConstructor.prototype);
  if (existingRestore) return existingRestore;

  const originalFocus = HTMLElementConstructor.prototype.focus;

  HTMLElementConstructor.prototype.focus = function focus(options) {
    if (!isElementFocusable(this)) return;
    return originalFocus.call(this, options);
  };

  const originalGetClientRects = ElementConstructor.prototype.getClientRects;

  // @ts-expect-error
  ElementConstructor.prototype.getClientRects = function getClientRects() {
    const isHidden = (element: Element) => {
      if (!element.isConnected) return true;
      const parent = element.parentElement;
      if (parent && isHidden(parent)) return true;
      if (!parent) {
        const frame = element.ownerDocument.defaultView?.frameElement;
        if (frame) {
          ensureBrowserShims(frame);
          if (frame.getClientRects().length === 0) return true;
        }
      }
      if (!(element instanceof HTMLElementConstructor)) return false;
      if (element.hidden) return true;
      const style = targetWindow.getComputedStyle(element);
      return style.display === "none" || style.visibility === "hidden";
    };
    if (isHidden(this)) return [];
    return [{ width: 1, height: 1 }];
  };

  if (!ElementConstructor.prototype.scrollIntoView) {
    ElementConstructor.prototype.scrollIntoView = noop;
  }

  if (!ElementConstructor.prototype.hasPointerCapture) {
    ElementConstructor.prototype.hasPointerCapture = noop;
  }

  if (!ElementConstructor.prototype.setPointerCapture) {
    ElementConstructor.prototype.setPointerCapture = noop;
  }

  if (!ElementConstructor.prototype.releasePointerCapture) {
    ElementConstructor.prototype.releasePointerCapture = noop;
  }

  polyfillMouseEventMembers(targetWindow);
  patchKeyboardEventModifierState(targetWindow);

  // happy-dom doesn't implement window.alert (jsdom and real browsers do).
  // Provide a no-op so code that calls or spies on it works under happy-dom.
  if (isHappyDOM(targetWindow) && typeof targetWindow.alert !== "function") {
    targetWindow.alert = () => {};
  }

  // happy-dom diverges from real browsers in a few spec-conformance areas; these
  // shims patch them for the whole test environment (jsdom already behaves
  // correctly). Each helper returns a function that restores the original
  // behavior.
  const restoreHappyDOMShims =
    isHappyDOM(targetWindow) &&
    typeof window !== "undefined" &&
    targetWindow === window
      ? [
          patchHappyDOMValidationMessage(),
          patchHappyDOMFormData(),
          patchHappyDOMSelectionChange(),
          patchHappyDOMAnimationFrame(),
          patchHappyDOMProxiedParentNode(),
        ]
      : [];

  const restore = () => {
    HTMLElementConstructor.prototype.focus = originalFocus;
    ElementConstructor.prototype.getClientRects = originalGetClientRects;
    for (const restore of restoreHappyDOMShims) restore();
    appliedBrowserShims.delete(ElementConstructor.prototype);
  };
  appliedBrowserShims.set(ElementConstructor.prototype, restore);
  return restore;
}

export function ensureBrowserShims(target: OwnerWindowSource) {
  const targetWindow = getOwnerWindow(target);
  applyBrowserShims(targetWindow);
  return targetWindow;
}

export function isVisible(element: Element) {
  ensureBrowserShims(element);
  return isElementVisible(element);
}

export function isFocusable(element: Element) {
  ensureBrowserShims(element);
  return isElementFocusable(element);
}

export function getElementStyle(element: Element) {
  return ensureBrowserShims(element)?.getComputedStyle(element);
}

function polyfillClipboardEvent(targetWindow: Window & typeof globalThis) {
  if (typeof targetWindow.ClipboardEvent !== "undefined") return;
  if (typeof targetWindow.Event === "undefined") return;
  const { Event: EventConstructor } = targetWindow;
  targetWindow.ClipboardEvent = class ClipboardEvent extends EventConstructor {
    #clipboardData: DataTransfer | null;

    constructor(type: string, eventInitDict: ClipboardEventInit | null = {}) {
      const eventInit = eventInitDict ?? {};
      super(type, eventInit);
      this.#clipboardData = eventInit.clipboardData ?? null;
    }

    get clipboardData() {
      return this.#clipboardData;
    }
  };
}

// The modifier keys every mouse and keyboard event exposes as a standard flag.
// A Map, because an object literal would resolve `Object.prototype` key names
// such as `constructor` to a bogus flag.
const standardModifierFlags = new Map<
  string,
  "altKey" | "ctrlKey" | "metaKey" | "shiftKey"
>([
  ["Alt", "altKey"],
  ["Control", "ctrlKey"],
  ["Meta", "metaKey"],
  ["Shift", "shiftKey"],
]);

// The modifier keys an event carries only as an `EventModifierInit` member.
// This mirrors `modifierNameByInitMember` in `__init-event.ts`, which also
// leaves out `modifierHyper` and `modifierSuper` and records why.
// https://w3c.github.io/uievents/#event-modifier-initializers
const initOnlyModifierMembers = new Map<string, keyof EventModifierInit>([
  ["AltGraph", "modifierAltGraph"],
  ["CapsLock", "modifierCapsLock"],
  ["Fn", "modifierFn"],
  ["FnLock", "modifierFnLock"],
  ["NumLock", "modifierNumLock"],
  ["ScrollLock", "modifierScrollLock"],
  ["Symbol", "modifierSymbol"],
  ["SymbolLock", "modifierSymbolLock"],
]);

// happy-dom's MouseEvent implements neither `getModifierState` nor the `x`/`y`
// aliases of `clientX`/`clientY`, which browsers and jsdom provide. A named
// dispatcher installs both while initializing the event, so only events the
// caller built reached listeners without them. PointerEvent extends MouseEvent
// and inherits this patch.
// https://github.com/ariakit/ariakit/issues/7156
// https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/getModifierState
// https://drafts.csswg.org/cssom-view/#dom-mouseevent-x
function polyfillMouseEventMembers(targetWindow: Window & typeof globalThis) {
  if (typeof targetWindow.MouseEvent === "undefined") return;
  const prototype = targetWindow.MouseEvent.prototype;

  if (typeof prototype.getModifierState !== "function") {
    // happy-dom's constructor keeps only the standard flags and drops the
    // `modifier*` init members, so this fallback can never report the others.
    // https://github.com/ariakit/ariakit/issues/7165
    // Plain assignment matches the writable, enumerable, configurable
    // descriptor browsers and jsdom give this method.
    prototype.getModifierState = function getModifierState(
      this: MouseEvent,
      key: string,
    ) {
      const flag = standardModifierFlags.get(key);
      if (!flag) return false;
      return this[flag];
    };
  }

  const aliases = [
    ["x", "clientX"],
    ["y", "clientY"],
  ] as const;

  for (const [alias, source] of aliases) {
    if (alias in prototype) continue;
    Object.defineProperty(prototype, alias, {
      configurable: true,
      enumerable: true,
      get(this: MouseEvent) {
        return this[source];
      },
    });
  }
}

// happy-dom's KeyboardEvent lowercases the name `getModifierState` is given, so
// `shift` matches `Shift`, and it answers `AltGraph` from `altKey`. Its
// constructor also keeps only the standard flags, dropping every `modifier*`
// init member, which a prototype patch alone can no longer recover. Browsers
// and jsdom match the exact UI Events names and read `AltGraph` from its own
// member, so record the initializer as the event is built and answer from it.
// https://github.com/ariakit/ariakit/issues/7166
// https://w3c.github.io/uievents/#event-modifier-initializers
function patchKeyboardEventModifierState(
  targetWindow: Window & typeof globalThis,
) {
  const OriginalKeyboardEvent = targetWindow.KeyboardEvent;
  if (typeof OriginalKeyboardEvent !== "function") return;
  const prototype = OriginalKeyboardEvent.prototype;

  if (typeof prototype.getModifierState === "function") {
    const probe = new OriginalKeyboardEvent("keydown", {
      altKey: true,
      modifierCapsLock: true,
    });
    // A conformant implementation keeps the `modifier*` members, matches the
    // exact names, and reads `AltGraph` from its own member. Probing the
    // behavior rather than the environment retires this shim on its own once
    // happy-dom conforms.
    const isConformant =
      probe.getModifierState("CapsLock") &&
      !probe.getModifierState("AltGraph") &&
      !probe.getModifierState("alt");
    if (isConformant) return;
  }

  const initModifiers = new WeakMap<KeyboardEvent, Set<string>>();

  // A Proxy rather than a subclass: events the environment builds from its own
  // class, such as `document.createEvent("KeyboardEvent")`, keep passing
  // `instanceof`.
  const PatchedKeyboardEvent = new Proxy(OriginalKeyboardEvent, {
    construct(target, args, newTarget) {
      const event: KeyboardEvent = Reflect.construct(target, args, newTarget);
      const init: EventModifierInit | undefined = args[1];
      if (!init) return event;
      const modifiers = new Set<string>();
      // A plain get, the way WebIDL reads a dictionary member and the way the
      // environment itself reads the standard flags, so an inherited member
      // counts.
      for (const [modifier, member] of initOnlyModifierMembers) {
        if (init[member]) {
          modifiers.add(modifier);
        }
      }
      if (modifiers.size) {
        initModifiers.set(event, modifiers);
      }
      return event;
    },
  });

  targetWindow.KeyboardEvent = PatchedKeyboardEvent;
  // An event reports the same constructor the global exposes, so move the
  // prototype's own pointer to the wrapper as well.
  prototype.constructor = PatchedKeyboardEvent;

  prototype.getModifierState = function getModifierState(
    this: KeyboardEvent,
    key: string,
  ) {
    if (!arguments.length) {
      throw new TypeError(
        "Failed to execute 'getModifierState' on 'KeyboardEvent': 1 argument required, but only 0 present.",
      );
    }
    const flag = standardModifierFlags.get(key);
    if (flag) return this[flag];
    // An event the environment built from its own class has no recorded
    // initializer, leaving only the standard flags above to report.
    return initModifiers.get(this)?.has(key) ?? false;
  };
}

// happy-dom omits built-in constraint messages. Use jsdom's generic text so
// shared form tests see a non-empty, environment-independent message.
function patchHappyDOMValidationMessage() {
  const restores: Array<() => void> = [];
  for (const Constructor of [
    window.HTMLInputElement,
    window.HTMLTextAreaElement,
    window.HTMLSelectElement,
  ]) {
    if (!Constructor) continue;
    const descriptor = Object.getOwnPropertyDescriptor(
      Constructor.prototype,
      "validationMessage",
    );
    if (!descriptor?.get || !descriptor.configurable) continue;
    const originalGet = descriptor.get;
    Object.defineProperty(Constructor.prototype, "validationMessage", {
      configurable: true,
      get(this: { validity?: ValidityState }) {
        const message = originalGet.call(this) as string;
        if (message) return message;
        if (this.validity && !this.validity.valid) {
          return "Constraints not satisfied";
        }
        return message;
      },
    });
    restores.push(() => {
      Object.defineProperty(
        Constructor.prototype,
        "validationMessage",
        descriptor,
      );
    });
  }
  return () => {
    for (const restore of restores) restore();
  };
}

// happy-dom includes disabled selects and textareas in FormData. Blank their
// names during construction so same-named enabled entries remain intact.
// Fieldset-disabled descendants are a separate upstream gap.
function patchHappyDOMFormData() {
  const OriginalFormData = window.FormData;
  if (!OriginalFormData) return noop;
  class PatchedFormData extends OriginalFormData {
    constructor(form?: HTMLFormElement, submitter?: HTMLElement | null) {
      const renamed: Array<[Element, string]> = [];
      if (form) {
        for (const element of Array.from(form.elements)) {
          const control = element as HTMLSelectElement | HTMLTextAreaElement;
          if (!control.name || !control.disabled) continue;
          if (control.tagName !== "SELECT" && control.tagName !== "TEXTAREA") {
            continue;
          }
          renamed.push([control, control.name]);
          control.removeAttribute("name");
        }
      }
      try {
        super(form, submitter);
      } finally {
        for (const [control, name] of renamed) {
          control.setAttribute("name", name);
        }
      }
    }
  }
  window.FormData = PatchedFormData;
  return () => {
    window.FormData = OriginalFormData;
  };
}

// happy-dom dispatches `selectionchange` synchronously from removeAllRanges(),
// before focus moves. Defer it to the task queue to match the spec, jsdom, and
// browsers.
function patchHappyDOMSelectionChange() {
  const SelectionPrototype = window.Selection?.prototype;
  const originalRemoveAllRanges = SelectionPrototype?.removeAllRanges;
  if (!SelectionPrototype || !originalRemoveAllRanges) return noop;
  SelectionPrototype.removeAllRanges = function removeAllRanges() {
    const originalDispatchEvent = window.document.dispatchEvent;
    window.document.dispatchEvent = function dispatchEvent(event: Event) {
      if (event.type === "selectionchange") {
        setTimeout(() => originalDispatchEvent.call(window.document, event));
        return true;
      }
      return originalDispatchEvent.call(this, event);
    };
    try {
      return originalRemoveAllRanges.call(this);
    } finally {
      window.document.dispatchEvent = originalDispatchEvent;
    }
  };
  return () => {
    SelectionPrototype.removeAllRanges = originalRemoveAllRanges;
  };
}

// happy-dom schedules same-frame callbacks as separate tasks. Batch a frame's
// initial callbacks with one timestamp and defer callbacks added during the
// batch, matching browsers without a 16ms test delay.
// https://html.spec.whatwg.org/multipage/imagebitmap-and-animations.html#run-the-animation-frame-callbacks
function patchHappyDOMAnimationFrame() {
  const originalRequestAnimationFrame = window.requestAnimationFrame;
  const originalCancelAnimationFrame = window.cancelAnimationFrame;

  let nextHandle = 1;
  const pending = new Map<number, FrameRequestCallback>();
  let flushScheduled = false;

  const flush = () => {
    flushScheduled = false;
    // Snapshot only the handles registered before this frame; a callback added
    // during the flush keeps its entry in `pending` and runs on the next frame.
    // Re-read each handle from the live map and remove it right before invoking,
    // so a callback can still cancel another not-yet-run callback in the same
    // frame (`cancelAnimationFrame` deletes from this same map).
    const handles = Array.from(pending.keys());
    const timestamp = window.performance.now();
    for (const handle of handles) {
      const callback = pending.get(handle);
      if (!callback) continue;
      pending.delete(handle);
      try {
        callback(timestamp);
      } catch (error) {
        // A throwing callback is reported but must not abort the rest of the
        // batch; rethrow asynchronously so the frame keeps running.
        window.setTimeout(() => {
          throw error;
        });
      }
    }
  };

  window.requestAnimationFrame = function requestAnimationFrame(callback) {
    const handle = nextHandle++;
    pending.set(handle, callback);
    if (!flushScheduled) {
      flushScheduled = true;
      // Schedule through the window's own timer so happy-dom's async task
      // manager tracks the pending frame; a raw setImmediate would be invisible
      // to teardown. A 0ms delay stays as fast as the native setImmediate.
      window.setTimeout(flush, 0);
    }
    return handle;
  };

  window.cancelAnimationFrame = function cancelAnimationFrame(handle) {
    pending.delete(handle);
  };

  return () => {
    window.requestAnimationFrame = originalRequestAnimationFrame;
    window.cancelAnimationFrame = originalCancelAnimationFrame;
  };
}

// happy-dom can point existing form/select children at the raw target instead
// of its public Proxy. Repair the parent pointer after connection; a custom
// element's synchronous connectedCallback may still observe the raw target.
// https://github.com/ariakit/ariakit/issues/6849
// https://github.com/capricorn86/happy-dom/issues/2253
// https://github.com/ariakit/ariakit/pull/6873#discussion_r3654110630
// TODO: Remove this shim once the upstream fix ships.
function patchHappyDOMProxiedParentNode() {
  const nodePrototype = window.Node.prototype;
  // Discover and verify the internal hook so this becomes a no-op if
  // happy-dom's internals change.
  const connectedToNodeSymbol = Object.getOwnPropertySymbols(
    nodePrototype,
  ).find((symbol) => symbol.description === "connectedToNode");
  if (!connectedToNodeSymbol) return noop;

  const connectedToNodeDescriptor = Object.getOwnPropertyDescriptor(
    nodePrototype,
    connectedToNodeSymbol,
  );
  if (!connectedToNodeDescriptor) return noop;
  const originalConnectedToNode = connectedToNodeDescriptor.value;
  if (typeof originalConnectedToNode !== "function") return noop;

  const container = document.createElement("div");
  const proxiedParent = document.createElement("form");
  const child = document.createElement("div");
  proxiedParent.append(child);
  container.append(proxiedParent);

  const rawParent = child.parentNode;
  if (!rawParent || rawParent === proxiedParent) return noop;

  const rawParentSymbols = Object.getOwnPropertySymbols(rawParent);
  const parentNodeSymbol = rawParentSymbols.find(
    (symbol) => symbol.description === "parentNode",
  );
  const proxySymbol = rawParentSymbols.find(
    (symbol) => symbol.description === "proxy",
  );
  if (!parentNodeSymbol || !proxySymbol) return noop;
  if (Reflect.get(child, parentNodeSymbol) !== rawParent) return noop;
  if (Reflect.get(rawParent, proxySymbol) !== proxiedParent) return noop;

  const inheritsOriginalConnectedToNode = (prototype: object) => {
    if (Object.hasOwn(prototype, connectedToNodeSymbol)) return false;
    let currentPrototype: object | null = Object.getPrototypeOf(prototype);
    while (currentPrototype) {
      const descriptor = Object.getOwnPropertyDescriptor(
        currentPrototype,
        connectedToNodeSymbol,
      );
      if (descriptor) {
        return descriptor.value === originalConnectedToNode;
      }
      currentPrototype = Object.getPrototypeOf(currentPrototype);
    }
    return false;
  };

  const restores: Array<() => void> = [];

  for (const Constructor of [
    window.HTMLFormElement,
    window.HTMLSelectElement,
  ]) {
    if (!Constructor) continue;
    if (!inheritsOriginalConnectedToNode(Constructor.prototype)) continue;
    Object.defineProperty(Constructor.prototype, connectedToNodeSymbol, {
      ...connectedToNodeDescriptor,
      value: function connectedToNode(this: Node) {
        Reflect.apply(originalConnectedToNode, this, []);
        const proxy: unknown = Reflect.get(this, proxySymbol);
        if (!(proxy instanceof window.Node)) return;
        for (const child of this.childNodes) {
          if (child.parentNode === proxy) continue;
          Reflect.set(child, parentNodeSymbol, proxy);
        }
      },
    });
    restores.push(() => {
      // The hook was inherited from Node.prototype, so removing the override
      // restores it rather than reassigning it.
      Reflect.deleteProperty(Constructor.prototype, connectedToNodeSymbol);
    });
  }

  return () => {
    for (const restore of restores) {
      restore();
    }
  };
}

applyBrowserShims();
