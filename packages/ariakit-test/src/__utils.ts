import { isFocusable } from "@ariakit/core/utils/focus";
import { noop } from "@ariakit/core/utils/misc";

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

  return () => {
    HTMLElement.prototype.focus = originalFocus;
    Element.prototype.getClientRects = originalGetClientRects;
  };
}

export async function wrapAsync<T>(fn: () => Promise<T>) {
  const restoreActEnvironment = setActEnvironment(false);
  const removeBrowserPolyfills = applyBrowserPolyfills();
  try {
    return await fn();
  } finally {
    restoreActEnvironment();
    removeBrowserPolyfills();
  }
}
