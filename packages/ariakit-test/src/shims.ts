// oxlint-disable unbound-method
import { isFocusable, noop } from "@ariakit/utils";
import { isBrowser, isHappyDOM } from "./__utils.ts";

// Apply shims at import because components read layout and focusability between
// interactions. Both public DOM entry points load this side effect.
// https://github.com/ariakit/ariakit/pull/6256#discussion_r3366022385

function applyBrowserShims() {
  if (isBrowser) return noop;
  // Importing `@ariakit/test` in plain Node must remain a no-op.
  if (
    typeof window === "undefined" ||
    typeof HTMLElement === "undefined" ||
    typeof Element === "undefined"
  ) {
    return noop;
  }

  const originalFocus = HTMLElement.prototype.focus;

  HTMLElement.prototype.focus = function focus(options) {
    if (!isFocusable(this)) return;
    return originalFocus.call(this, options);
  };

  const originalGetClientRects = Element.prototype.getClientRects;

  // @ts-expect-error
  Element.prototype.getClientRects = function getClientRects() {
    const isHidden = (element: Element) => {
      if (!element.isConnected) return true;
      if (element.parentElement && isHidden(element.parentElement)) return true;
      if (!(element instanceof HTMLElement)) return false;
      if (element.hidden) return true;
      const style = getComputedStyle(element);
      return style.display === "none" || style.visibility === "hidden";
    };
    if (isHidden(this)) return [];
    return [{ width: 1, height: 1 }];
  };

  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = noop;
  }

  if (!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = noop;
  }

  if (!Element.prototype.setPointerCapture) {
    Element.prototype.setPointerCapture = noop;
  }

  if (!Element.prototype.releasePointerCapture) {
    Element.prototype.releasePointerCapture = noop;
  }

  if (
    typeof window.ClipboardEvent === "undefined" &&
    typeof Event !== "undefined"
  ) {
    // @ts-expect-error
    window.ClipboardEvent = class ClipboardEvent extends Event {};
  }

  if (
    typeof window.PointerEvent === "undefined" &&
    typeof MouseEvent !== "undefined"
  ) {
    // @ts-expect-error
    window.PointerEvent = class PointerEvent extends MouseEvent {};
  }

  // happy-dom doesn't implement window.alert (jsdom and real browsers do).
  // Provide a no-op so code that calls or spies on it works under happy-dom.
  if (isHappyDOM() && typeof window.alert !== "function") {
    window.alert = () => {};
  }

  // happy-dom diverges from real browsers in a few spec-conformance areas; these
  // shims patch them for the whole test environment (jsdom already behaves
  // correctly). Each helper returns a function that restores the original
  // behavior.
  const restoreHappyDOMShims = isHappyDOM()
    ? [
        patchHappyDOMValidationMessage(),
        patchHappyDOMFormData(),
        patchHappyDOMSelectionChange(),
        patchHappyDOMAnimationFrame(),
        patchHappyDOMProxiedParentNode(),
      ]
    : [];

  return () => {
    HTMLElement.prototype.focus = originalFocus;
    Element.prototype.getClientRects = originalGetClientRects;
    for (const restore of restoreHappyDOMShims) restore();
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
