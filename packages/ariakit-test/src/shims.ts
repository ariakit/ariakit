// oxlint-disable unbound-method
import { isFocusable, noop } from "@ariakit/utils";
import { isBrowser, isHappyDOM } from "./__utils.ts";

// Apply the browser shims once for the whole test environment, instead of only
// while a simulated interaction runs. Components read layout and focusability
// between interactions too — for example a dialog's auto-focus effect calls
// `getFirstTabbableIn`, which uses the `getClientRects` shim to decide whether
// an element is visible. If the shims only existed inside `wrapAsync`, those
// reads would hit jsdom's empty layout and misbehave (focus landing on the
// dialog container instead of the first tabbable).
//
// `index.ts` imports this module for its side effect, so the shims are applied
// automatically when importing `@ariakit/test` (and `@ariakit/test/react`,
// which re-exports `index.ts`).

function applyBrowserShims() {
  if (isBrowser) return noop;
  // Run at import (the call below), so guard against a missing DOM — when
  // `@ariakit/test` is imported in a plain Node context there's nothing to
  // shim, and patching the DOM constructors below would throw.
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
        patchHappyDOMProxiedContains(),
      ]
    : [];

  return () => {
    HTMLElement.prototype.focus = originalFocus;
    Element.prototype.getClientRects = originalGetClientRects;
    for (const restore of restoreHappyDOMShims) restore();
  };
}

// happy-dom returns an empty validationMessage for built-in constraint
// violations (only setCustomValidity populates it); jsdom and real browsers
// return a non-empty message. Ariakit's form validation reads
// element.validationMessage to register errors, so mirror that here. The exact
// string matches jsdom's generic message so the shared form example tests assert
// the same text under both environments (real browsers use locale-specific text,
// which these tests don't depend on).
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

// happy-dom's FormData constructor only checks `disabled` for <input> controls,
// so disabled <select>/<textarea> are wrongly included; the HTML spec (like real
// browsers) excludes all disabled controls. Temporarily blank their names so the
// constructor skips them, then restore the names. Blanking — rather than deleting
// entries afterwards — lets the constructor build the entry list correctly and
// avoids removing same-named entries that belong to other, enabled controls.
// (Controls disabled only via an ancestor <fieldset disabled> are not handled
// here: happy-dom doesn't propagate that to descendants for any control type, so
// it's a broader happy-dom gap, not specific to this <select>/<textarea> bug.)
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

// happy-dom dispatches the `selectionchange` event synchronously from inside
// Selection.removeAllRanges(). The spec — and jsdom and real browsers — queue it
// as a task instead, so it fires after the current synchronous work settles.
// @ariakit/test calls selection.removeAllRanges() before moving focus on mouse
// down, so a synchronous selectionchange runs listeners while
// document.activeElement is still stale (e.g. <body>), which can misfire
// selection-driven UI. Defer the dispatch triggered during removeAllRanges to a
// macrotask to match the spec/jsdom ordering.
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

// happy-dom schedules each `requestAnimationFrame` callback as its own
// `setImmediate`, so callbacks registered for the same frame run in separate
// tasks — and, under React, separate commits — instead of one batch. The HTML
// spec runs the animation frame callbacks as a batch: it snapshots the
// callbacks registered before the frame, invokes them all with a single shared
// timestamp, and defers any callback registered *during* the run to the next
// frame. jsdom and real browsers behave this way; happy-dom's unbatched
// behavior makes siblings that schedule work in the same frame observe each
// other's mid-flight state (e.g. a dialog and its backdrop, which read each
// other's computed styles while a leave animation is being set up). Restore
// spec-compliant batching while keeping happy-dom fast: a single 0ms timer per
// frame rather than a 16ms wall-clock frame (the spec leaves the frame rate
// implementation-defined, so the fast cadence is still conformant).
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

// happy-dom's HTMLFormElement and HTMLSelectElement constructors return a Proxy
// for their legacy member access (`form.username`, `select[0]`). Inserting one
// into a parent re-points the children it already has at the raw target rather
// than that proxy, while `contains()` compares against the proxy — so it walks a
// parent chain that never matches and reports false for those descendants. jsdom
// and real browsers return true, per the spec's inclusive-descendant definition.
// Any insertion triggers it, including into a still-detached parent, and it
// persists after the subtree is removed again.
// Ariakit reads `contains` everywhere — most visibly, a modal dialog exempts
// `getPersistentElements` from `inert` with it, so everything inside a <form>
// looked like it was outside the dialog.
// https://dom.spec.whatwg.org/#dom-node-contains
// https://github.com/capricorn86/happy-dom/issues/2170
//
// Rather than reaching into happy-dom's internal symbols to repair the parent
// reference, ask the children instead: their own parent chain is intact, so they
// answer correctly. Only the two proxied element types get the override, and it
// only does extra work once the native check has already returned false. The
// same broken reference also breaks identity-based ancestor checks, which this
// shim leaves alone: https://github.com/ariakit/ariakit/issues/6849
//
// TODO: Remove this shim once the upstream fix ships.
// https://github.com/capricorn86/happy-dom/pull/2176
function patchHappyDOMProxiedContains() {
  const originalContains = window.Node.prototype.contains;
  const restores: Array<() => void> = [];

  for (const Constructor of [
    window.HTMLFormElement,
    window.HTMLSelectElement,
  ]) {
    if (!Constructor) continue;
    Constructor.prototype.contains = function contains(otherNode) {
      if (!otherNode) return false;
      if (originalContains.call(this, otherNode)) return true;
      for (const child of this.childNodes) {
        // A child can be proxied too — a <select> inside a <form> — so go
        // through its own `contains`, which unwraps every nested level and
        // already reports a node as containing itself.
        if (child.contains(otherNode)) return true;
      }
      return false;
    };
    restores.push(() => {
      // The method is inherited from Node.prototype, so removing the override
      // restores it rather than reassigning it.
      Reflect.deleteProperty(Constructor.prototype, "contains");
    });
  }

  return () => {
    for (const restore of restores) restore();
  };
}

applyBrowserShims();
