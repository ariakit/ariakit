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
// `index.ts` imports this module so the shims are applied automatically with
// the main entrypoint. It's also a public entrypoint (`@ariakit/test/shims`)
// for consumers that import individual helpers and want to opt in explicitly.

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
  if (isHappyDOM && typeof window.alert !== "function") {
    window.alert = () => {};
  }

  // happy-dom diverges from real browsers in a few spec-conformance areas; these
  // shims patch them for the whole test environment (jsdom already behaves
  // correctly). Each helper returns a function that restores the original
  // behavior.
  const restoreHappyDOMShims = isHappyDOM
    ? [
        patchHappyDOMValidationMessage(),
        patchHappyDOMFormData(),
        patchHappyDOMSelectionChange(),
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

applyBrowserShims();
