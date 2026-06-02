// oxlint-disable unbound-method
import { isFocusable, noop } from "@ariakit/utils";

export type DirtiableElement = Element & { dirty?: boolean };

export type TextField = HTMLInputElement | HTMLTextAreaElement;

export const isBrowser =
  typeof navigator !== "undefined" &&
  !navigator.userAgent.includes("jsdom") &&
  typeof window !== "undefined" &&
  !("happyDOM" in window);

export async function flushMicrotasks() {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
}

export function nextFrame() {
  return new Promise(requestAnimationFrame);
}

export function setActEnvironment(value: boolean) {
  const scope = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean };
  const previousValue = scope.IS_REACT_ACT_ENVIRONMENT;
  scope.IS_REACT_ACT_ENVIRONMENT = value;
  const restoreActEnvironment = () => {
    scope.IS_REACT_ACT_ENVIRONMENT = previousValue;
  };
  return restoreActEnvironment;
}

export function applyBrowserPolyfills() {
  if (isBrowser) return noop;

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

  if (typeof window.ClipboardEvent === "undefined") {
    // @ts-expect-error
    window.ClipboardEvent = class ClipboardEvent extends Event {};
  }

  if (typeof window.PointerEvent === "undefined") {
    // @ts-expect-error
    window.PointerEvent = class PointerEvent extends MouseEvent {};
  }

  // The following shims patch gaps in happy-dom's DOM implementation so it
  // matches real-browser (and HTML spec) behavior. They are scoped to happy-dom
  // because jsdom already behaves correctly.
  const restoreHappyDOMShims: Array<() => void> = [];

  if ("happyDOM" in window) {
    // happy-dom returns an empty validationMessage for built-in constraint
    // violations (only setCustomValidity populates it); jsdom and real browsers
    // return a non-empty message. Ariakit's form validation reads
    // element.validationMessage to register errors, so mirror that here. The
    // exact string matches jsdom's generic message so the shared form example
    // tests assert the same text under both environments (real browsers use
    // locale-specific text, which these tests don't depend on).
    for (const Constructor of [
      window.HTMLInputElement,
      window.HTMLTextAreaElement,
      window.HTMLSelectElement,
    ]) {
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
      restoreHappyDOMShims.push(() => {
        Object.defineProperty(
          Constructor.prototype,
          "validationMessage",
          descriptor,
        );
      });
    }

    // happy-dom's FormData constructor only checks `disabled` for <input>
    // controls, so disabled <select>/<textarea> are wrongly included; the HTML
    // spec (like real browsers) excludes all disabled controls. Temporarily
    // blank their names so the constructor skips them, then restore the names.
    // Blanking — rather than deleting entries afterwards — lets the constructor
    // build the entry list correctly and avoids removing same-named entries that
    // belong to other, enabled controls. (Controls disabled only via an ancestor
    // <fieldset disabled> are not handled here: happy-dom doesn't propagate that
    // to descendants for any control type, so it's a broader happy-dom gap, not
    // specific to this <select>/<textarea> bug.)
    const OriginalFormData = window.FormData;
    class PatchedFormData extends OriginalFormData {
      constructor(form?: HTMLFormElement, submitter?: HTMLElement | null) {
        const renamed: Array<[Element, string]> = [];
        if (form) {
          for (const element of Array.from(form.elements)) {
            const control = element as HTMLSelectElement | HTMLTextAreaElement;
            if (!control.name || !control.disabled) continue;
            if (
              control.tagName !== "SELECT" &&
              control.tagName !== "TEXTAREA"
            ) {
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
    restoreHappyDOMShims.push(() => {
      window.FormData = OriginalFormData;
    });
  }

  return () => {
    HTMLElement.prototype.focus = originalFocus;
    Element.prototype.getClientRects = originalGetClientRects;
    for (const restore of restoreHappyDOMShims) restore();
  };
}

let wrapAsyncDepth = 0;
let restoreCurrentWrapAsyncEnvironment = noop;

function setupWrapAsyncEnvironment() {
  wrapAsyncDepth += 1;
  if (wrapAsyncDepth > 1) return;

  let restoreActEnvironment = noop;

  try {
    restoreActEnvironment = setActEnvironment(false);
    const removeBrowserPolyfills = applyBrowserPolyfills();

    restoreCurrentWrapAsyncEnvironment = () => {
      restoreActEnvironment();
      removeBrowserPolyfills();
    };
  } catch (error) {
    wrapAsyncDepth -= 1;
    restoreActEnvironment();
    throw error;
  }
}

function restoreWrapAsyncEnvironment() {
  wrapAsyncDepth -= 1;
  if (wrapAsyncDepth) return;

  restoreCurrentWrapAsyncEnvironment();
  restoreCurrentWrapAsyncEnvironment = noop;
}

export async function wrapAsync<T>(fn: () => Promise<T>) {
  setupWrapAsyncEnvironment();
  try {
    return await fn();
  } finally {
    restoreWrapAsyncEnvironment();
  }
}
