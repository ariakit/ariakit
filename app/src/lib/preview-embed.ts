/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */

/** Identifies messages between preview cards and their preview frames. */
export const PREVIEW_MESSAGE_TYPE = "ariakit-preview";

/** A command that a preview card sends to its preview frame. */
export interface PreviewCommandMessage {
  type: typeof PREVIEW_MESSAGE_TYPE;
  action: "sync" | "back" | "forward" | "reload";
}

/**
 * The stored site theme values that the theme script applies to the root
 * element. A `null` value keeps the stylesheet default.
 */
export interface PreviewTheme {
  mode: string | null;
  brand: string | null;
  radius: string | null;
  canvas: string | null;
}

/**
 * Applies the site theme to a preview frame, which cannot read the site storage
 * when it comes from another origin, such as a Next.js preview.
 */
export interface PreviewThemeMessage {
  type: typeof PREVIEW_MESSAGE_TYPE;
  action: "theme";
  theme: PreviewTheme;
}

/** Reports the current location of a preview frame to its card. */
export interface PreviewLocationMessage {
  type: typeof PREVIEW_MESSAGE_TYPE;
  action: "location";
  href: string;
  loaded: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
}

/** Asks the card to scroll the page while the preview frame is inactive. */
export interface PreviewScrollMessage {
  type: typeof PREVIEW_MESSAGE_TYPE;
  action: "scroll";
  deltaX: number;
  deltaY: number;
  deltaMode: number;
}

export type PreviewFrameMessage = PreviewLocationMessage | PreviewScrollMessage;

/**
 * Prepares a preview page that a preview card embeds. It runs before the page
 * renders and does nothing when the page is the top-level document.
 *
 * - The page stays inactive until the person clicks or tabs into it. An
 *   inactive page does not scroll and ignores programmatic focus, so scrolling
 *   the docs page over a preview or hovering a component that moves focus on
 *   hover does not trap the docs page.
 * - The page reports its location and history state, and follows navigation
 *   commands from the card.
 * - The page applies the site theme that the card sends.
 *
 * This function is serialized into an inline script, so it must not reference
 * anything outside its own body.
 */
export function setupPreviewEmbed() {
  if (window.self === window.top) return;
  const type = "ariakit-preview";
  const root = document.documentElement;
  root.dataset.previewEmbedded = "";

  // A click focuses the window after pointerdown handlers run, and some
  // components move focus from those handlers.
  let pointerDown = false;
  const isActive = () => document.hasFocus() || pointerDown;
  const updateActive = () => {
    root.toggleAttribute("data-preview-active", document.hasFocus());
  };
  updateActive();
  window.addEventListener("focus", updateActive);
  window.addEventListener("blur", () => {
    pointerDown = false;
    updateActive();
  });
  window.addEventListener(
    "pointerdown",
    () => {
      pointerDown = true;
    },
    true,
  );
  window.addEventListener(
    "pointerup",
    () => {
      // Click handlers run in the same task as pointerup.
      setTimeout(() => {
        pointerDown = false;
      });
    },
    true,
  );

  const patchFocus = (prototype: HTMLElement | SVGElement) => {
    const focus: unknown = Object.getOwnPropertyDescriptor(
      prototype,
      "focus",
    )?.value;
    if (typeof focus !== "function") return;
    prototype.focus = function (options) {
      if (!isActive()) return;
      Reflect.apply(focus, this, [options]);
    };
  };
  patchFocus(HTMLElement.prototype);
  patchFocus(SVGElement.prototype);

  // The stylesheet stops the root scroller of an inactive page, so the browser
  // passes its wheel scrolling to the docs page. Inner scroll containers still
  // scroll, so their wheel events go to the card instead.
  const isScrollContainer = (element: Element) => {
    const style = getComputedStyle(element);
    const scrollsY =
      /auto|scroll/.test(style.overflowY) &&
      element.scrollHeight > element.clientHeight;
    const scrollsX =
      /auto|scroll/.test(style.overflowX) &&
      element.scrollWidth > element.clientWidth;
    return scrollsY || scrollsX;
  };
  const isInScrollContainer = (target: EventTarget | null) => {
    let element = target instanceof Element ? target : null;
    while (element && element !== document.body) {
      if (isScrollContainer(element)) return true;
      element = element.parentElement;
    }
    return false;
  };
  window.addEventListener(
    "wheel",
    (event) => {
      if (root.hasAttribute("data-preview-active")) return;
      // Pinch zoom on trackpads sends wheel events with ctrlKey.
      if (event.ctrlKey) return;
      if (!isInScrollContainer(event.target)) return;
      event.preventDefault();
      window.parent.postMessage(
        {
          type,
          action: "scroll",
          deltaX: event.deltaX,
          deltaY: event.deltaY,
          deltaMode: event.deltaMode,
        },
        "*",
      );
    },
    { capture: true, passive: false },
  );

  // The DOM types do not include the Navigation API yet. Unlike history, it
  // only moves through the entries of this frame, so the back button never
  // moves the docs page.
  interface FrameNavigation extends EventTarget {
    currentEntry: unknown;
    canGoBack: boolean;
    canGoForward: boolean;
    back: () => unknown;
    forward: () => unknown;
  }
  const isFrameNavigation = (value: unknown): value is FrameNavigation => {
    return !!value && typeof value === "object" && "canGoBack" in value;
  };
  // WebKit can expose the API with entries and events disabled in frames, which
  // leaves the current entry empty.
  const navigation =
    "navigation" in window &&
    isFrameNavigation(window.navigation) &&
    window.navigation.currentEntry != null
      ? window.navigation
      : undefined;

  // WebKit adds no session history entries for history.pushState() in frames,
  // so history.back() there moves the docs page. Without the Navigation API,
  // the frame keeps its own entries and restores one the way a back button
  // would: it replaces the current entry and fires popstate, which client-side
  // routers, such as the Next.js App Router, handle. WebKit also keeps
  // history.state empty in frames, so each entry stores the state that the
  // router passed. The entries belong to the current document, so a reload
  // starts them again from the current entry.
  interface FrameEntry {
    url: string;
    state: unknown;
  }
  const pushState = history.pushState.bind(history);
  const replaceState = history.replaceState.bind(history);
  const getCurrentEntry = (state: unknown): FrameEntry => {
    return { url: location.href, state };
  };
  const entries = [getCurrentEntry(history.state)];
  let index = 0;
  const restoreEntry = (nextIndex: number) => {
    const entry = entries[nextIndex];
    if (!entry) return;
    index = nextIndex;
    replaceState(entry.state, "", entry.url);
    window.dispatchEvent(new PopStateEvent("popstate", { state: entry.state }));
  };
  const canGoBack = () => (navigation ? navigation.canGoBack : index > 0);
  const canGoForward = () => {
    return navigation ? navigation.canGoForward : index < entries.length - 1;
  };

  const postLocation = () => {
    window.parent.postMessage(
      {
        type,
        action: "location",
        href: location.href,
        loaded: document.readyState === "complete",
        canGoBack: canGoBack(),
        canGoForward: canGoForward(),
      },
      "*",
    );
  };
  // Also reports client-side routing, such as the Next.js App Router.
  if (navigation) {
    navigation.addEventListener("currententrychange", postLocation);
  } else {
    history.pushState = (...args) => {
      pushState(...args);
      entries.splice(index + 1, entries.length, getCurrentEntry(args[0]));
      index += 1;
      postLocation();
    };
    history.replaceState = (...args) => {
      replaceState(...args);
      entries[index] = getCurrentEntry(args[0]);
      postLocation();
    };
    const withoutHash = (url: string) => url.replace(/#.*$/, "");
    window.addEventListener("popstate", (event) => {
      const entry = entries[index];
      if (event.isTrusted && entry) {
        if (withoutHash(entry.url) === withoutHash(location.href)) {
          // Fragment navigations also fire popstate. They stay on the current
          // entry and keep its router state.
          entries[index] = { url: location.href, state: entry.state };
        } else {
          // A native traversal, such as the browser back button, moves to an
          // entry that the list cannot place, so the list starts again from it.
          entries.splice(0, entries.length, getCurrentEntry(event.state));
          index = 0;
        }
      }
      postLocation();
    });
    window.addEventListener("hashchange", postLocation);
  }
  window.addEventListener("load", postLocation);

  // Matches the theme script of the site, which reads the same values from
  // storage in same-origin previews.
  const applyTheme = (theme: object) => {
    const read = (key: string) => {
      const value: unknown = Reflect.get(theme, key);
      return typeof value === "string" ? value : null;
    };
    const setProperty = (property: string, value: string | null) => {
      if (value) {
        root.style.setProperty(property, value);
      } else {
        root.style.removeProperty(property);
      }
    };
    const mode = read("mode");
    if (mode === "light" || mode === "dark") {
      root.dataset.theme = mode;
      root.style.colorScheme = mode;
    } else {
      delete root.dataset.theme;
      root.style.removeProperty("color-scheme");
    }
    setProperty("--color-brand", read("brand"));
    setProperty("--radius", read("radius"));
    const canvas = read("canvas");
    if (canvas) {
      root.dataset.canvas = canvas;
    } else {
      delete root.dataset.canvas;
    }
  };

  window.addEventListener("message", (event) => {
    if (event.source !== window.parent) return;
    const data: unknown = event.data;
    if (!data || typeof data !== "object") return;
    if (!("type" in data) || data.type !== type) return;
    if (!("action" in data)) return;
    switch (data.action) {
      case "sync":
        postLocation();
        break;
      case "back":
        if (!canGoBack()) break;
        if (navigation) {
          navigation.back();
        } else {
          restoreEntry(index - 1);
        }
        break;
      case "forward":
        if (!canGoForward()) break;
        if (navigation) {
          navigation.forward();
        } else {
          restoreEntry(index + 1);
        }
        break;
      case "reload":
        location.reload();
        break;
      case "theme":
        if ("theme" in data && data.theme && typeof data.theme === "object") {
          applyTheme(data.theme);
        }
        break;
    }
  });

  // Reports while the page still parses, so the card sends the theme before the
  // frame renders and before its load event reveals the frame.
  postLocation();
}

/**
 * The inline script that runs `setupPreviewEmbed` in a preview page. Bundlers
 * that keep function names, such as esbuild in the Next.js Worker build, wrap
 * nested functions in a `__name` helper from the module scope, which the
 * serialized function cannot reach. So the script defines its own.
 */
export const previewEmbedScript = `(() => {
  const __name = (target) => target;
  (${setupPreviewEmbed.toString()})();
})();`;

function hasTypes(
  data: object,
  types: Record<string, "string" | "number" | "boolean">,
) {
  return Object.entries(types).every(([key, type]) => {
    return typeof Reflect.get(data, key) === type;
  });
}

/**
 * Checks whether a message comes from a preview frame. The frame can navigate
 * to any document, so the card checks every field it reads.
 */
export function isPreviewFrameMessage(
  data: unknown,
): data is PreviewFrameMessage {
  if (!data || typeof data !== "object") return false;
  if (!("type" in data) || data.type !== PREVIEW_MESSAGE_TYPE) return false;
  if (!("action" in data)) return false;
  if (data.action === "location") {
    return hasTypes(data, {
      href: "string",
      loaded: "boolean",
      canGoBack: "boolean",
      canGoForward: "boolean",
    });
  }
  if (data.action === "scroll") {
    return hasTypes(data, {
      deltaX: "number",
      deltaY: "number",
      deltaMode: "number",
    });
  }
  return false;
}
