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
  action: "sync" | "back" | "forward" | "reload" | "activate" | "deactivate";
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

/**
 * Gives a preview frame the inner corner radius of the card viewport around it,
 * so app shells in the frame keep nested corners concentric with the card.
 */
export interface PreviewViewportMessage {
  type: typeof PREVIEW_MESSAGE_TYPE;
  action: "viewport";
  radius: string;
}

/** Reports the current location of a preview frame to its card. */
export interface PreviewLocationMessage {
  type: typeof PREVIEW_MESSAGE_TYPE;
  action: "location";
  href: string;
  loaded: boolean;
  /**
   * Whether the page is still opening its popup. The card keeps the page hidden
   * until then, so the page does not show its trigger and then jump. Frames
   * deployed before this field, such as a Next.js preview from an older deploy,
   * leave it out.
   */
  opening?: boolean;
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
 *   hover does not trap the docs page. The card also lets the page scroll while
 *   the person resizes it, until they interact with the docs page.
 * - Interactions on the docs page do not close popups in the page. A page with
 *   `data-preview-open` on its root opens its popup once it hydrates, so the
 *   card presents the popup and not only its trigger.
 * - The page reports its location and history state, and follows navigation
 *   commands from the card.
 * - The page applies the site theme and the viewport radius that the card
 *   sends.
 *
 * This function is serialized into an inline script, so it must not reference
 * anything outside its own body.
 */
export function setupPreviewEmbed() {
  if (window.self === window.top) return;
  const type = "ariakit-preview";
  const root = document.documentElement;
  root.dataset.previewEmbedded = "";
  let opening = root.hasAttribute("data-preview-open");

  // A click focuses the window after pointerdown handlers run, and some
  // components move focus from those handlers.
  let pointerDown = false;
  const isActive = () => document.hasFocus() || pointerDown;
  // A resize from the card lets the page scroll, but focus stays on the resize
  // handle, so programmatic focus still waits for a person in the page.
  let resized = false;
  const updateActive = () => {
    root.toggleAttribute("data-preview-active", document.hasFocus() || resized);
  };
  updateActive();
  window.addEventListener("focus", updateActive);
  // Once the page had focus, the person moved on from the resize, so focus
  // decides again.
  window.addEventListener("blur", () => {
    pointerDown = false;
    resized = false;
    updateActive();
  });
  // Only a person activates the page, not the click that opens its popup.
  window.addEventListener(
    "pointerdown",
    (event) => {
      if (!event.isTrusted) return;
      pointerDown = true;
    },
    true,
  );
  window.addEventListener(
    "pointerup",
    (event) => {
      if (!event.isTrusted) return;
      // Click handlers run in the same task as pointerup.
      setTimeout(() => {
        pointerDown = false;
      });
    },
    true,
  );
  // A touch that scrolls cancels the pointer and does not click.
  window.addEventListener(
    "pointercancel",
    () => {
      pointerDown = false;
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

  // Ariakit dialogs and popovers listen for outside interactions in the highest
  // document they can read, which is the docs page for a same-origin preview.
  // Without its frame element, the page is the highest document, as in a
  // preview from another origin, so clicks and focus on the docs page keep
  // popups open.
  Object.defineProperty(window, "frameElement", {
    configurable: true,
    get: () => null,
  });

  // The gap in pixels between the viewport edge and an opened popup and its
  // trigger, the same as the page padding around the example.
  const popupMargin = 12;

  const nextFrame = () => {
    return new Promise((resolve) => requestAnimationFrame(resolve));
  };

  const isFixed = (element: Element) => {
    let current: Element | null = element;
    while (current) {
      if (getComputedStyle(current).position === "fixed") return true;
      current = current.parentElement;
    }
    return false;
  };

  // The trigger and its labels, such as the label above a combobox.
  const getTriggerElements = (trigger: Element) => {
    const elements = [trigger];
    const labels: unknown = Reflect.get(trigger, "labels");
    if (labels instanceof NodeList) {
      for (const label of labels) {
        if (label instanceof Element) {
          elements.push(label);
        }
      }
    }
    const ids = trigger.getAttribute("aria-labelledby")?.split(/\s+/) ?? [];
    for (const id of ids) {
      const label = document.getElementById(id);
      if (label) {
        elements.push(label);
      }
    }
    return elements;
  };

  const getBounds = (elements: Element[]) => {
    const rects = elements.map((element) => element.getBoundingClientRect());
    return {
      top: Math.min(...rects.map((rect) => rect.top)),
      bottom: Math.max(...rects.map((rect) => rect.bottom)),
    };
  };

  // Places the trigger at the top of the viewport, so a popup that scrolls with
  // the page opens below it, and then centers both. A fixed popup, such as a
  // modal dialog, does not move with the page, so the page keeps its scroll.
  // The page scrolls to absolute positions. With relative scrolls, frames in
  // iOS Safari were seen scrolled twice as far, past the trigger.
  const scrollToPopup = async (trigger: Element, popup: Element) => {
    if (isFixed(popup)) return;
    const triggerElements = getTriggerElements(trigger);
    const triggerTop = getBounds(triggerElements).top + window.scrollY;
    window.scrollTo({ top: triggerTop - popupMargin, behavior: "instant" });
    // Popups reposition after the scroll event, in the next frame.
    await nextFrame();
    await nextFrame();
    const { top, bottom } = getBounds([...triggerElements, popup]);
    const offset = (window.innerHeight - (bottom - top)) / 2;
    // A popup taller than the viewport keeps the trigger in view.
    if (offset <= popupMargin) return;
    window.scrollTo({
      top: top + window.scrollY - offset,
      behavior: "instant",
    });
  };

  const getPopup = (trigger: Element) => {
    const id = trigger.getAttribute("aria-controls");
    if (!id) return null;
    return document.getElementById(id);
  };

  // A modal dialog usually opens from a button without popup attributes, so the
  // first button is the trigger when no element exposes a closed popup.
  const getTrigger = () => {
    const popupTrigger = document.querySelector(
      "[aria-haspopup]:not([aria-haspopup=false])[aria-expanded=false]",
    );
    return popupTrigger ?? document.querySelector("button");
  };

  // Opens the popup with a click on its trigger, as a person would. The click
  // events are not trusted, so the page stays inactive and its popup does not
  // take focus from the docs page.
  const openPopup = async () => {
    const trigger = getTrigger();
    if (!trigger) return;
    const pointerInit = {
      bubbles: true,
      cancelable: true,
      composed: true,
      view: window,
      pointerType: "mouse",
      isPrimary: true,
    };
    const downInit = { ...pointerInit, buttons: 1 };
    // Components open popups on different events, such as Combobox on mousedown
    // and Disclosure on click.
    trigger.dispatchEvent(new PointerEvent("pointerdown", downInit));
    trigger.dispatchEvent(new MouseEvent("mousedown", downInit));
    trigger.dispatchEvent(new PointerEvent("pointerup", pointerInit));
    trigger.dispatchEvent(new MouseEvent("mouseup", pointerInit));
    trigger.dispatchEvent(new MouseEvent("click", pointerInit));
    // Popups render and position themselves in the next frames.
    await nextFrame();
    await nextFrame();
    if (trigger.getAttribute("aria-expanded") !== "true") return;
    const popup = getPopup(trigger);
    if (!popup) return;
    await scrollToPopup(trigger, popup);
  };

  // The preview island marks the root once the example has mounted, so the
  // trigger handles the click.
  const onHydrated = (callback: () => void) => {
    if (root.hasAttribute("data-preview-hydrated")) {
      callback();
      return;
    }
    const observer = new MutationObserver(() => {
      if (!root.hasAttribute("data-preview-hydrated")) return;
      observer.disconnect();
      callback();
    });
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["data-preview-hydrated"],
    });
    // A page without islands, such as a static preview, has nothing to hydrate.
    document.addEventListener("DOMContentLoaded", () => {
      if (document.querySelector("astro-island")) return;
      observer.disconnect();
      callback();
    });
  };

  // The stylesheet stops the root scroller of an inactive page, so the browser
  // passes its wheel scrolling to the docs page. Inner scroll containers still
  // scroll, so their wheel events go to the card instead. A container with
  // contained overscroll, such as an app shell sidebar, also keeps the wheel
  // from the docs page when its content fits.
  const isScrollContainer = (element: Element) => {
    const style = getComputedStyle(element);
    const scrollsY =
      /auto|scroll/.test(style.overflowY) &&
      (element.scrollHeight > element.clientHeight ||
        style.overscrollBehaviorY !== "auto");
    const scrollsX =
      /auto|scroll/.test(style.overflowX) &&
      (element.scrollWidth > element.clientWidth ||
        style.overscrollBehaviorX !== "auto");
    return scrollsY || scrollsX;
  };
  const getScrollContainers = (target: EventTarget | null) => {
    const containers: Element[] = [];
    let element = target instanceof Element ? target : null;
    while (element && element !== document.body) {
      if (isScrollContainer(element)) {
        containers.push(element);
      }
      element = element.parentElement;
    }
    return containers;
  };
  window.addEventListener(
    "wheel",
    (event) => {
      if (root.hasAttribute("data-preview-active")) return;
      // Pinch zoom on trackpads sends wheel events with ctrlKey.
      if (event.ctrlKey) return;
      if (!getScrollContainers(event.target).length) return;
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

  // Stopping a container hides its scrollbar. A classic scrollbar takes room,
  // so the content would reflow under the touch. Phones and tablets show
  // overlay scrollbars, which take none.
  const hasClassicScrollbar = (element: Element) => {
    if (!(element instanceof HTMLElement)) return false;
    const style = getComputedStyle(element);
    const borderX =
      Number.parseFloat(style.borderLeftWidth) +
      Number.parseFloat(style.borderRightWidth);
    const borderY =
      Number.parseFloat(style.borderTopWidth) +
      Number.parseFloat(style.borderBottomWidth);
    // The element sizes are rounded, so a pixel of difference is no scrollbar.
    return (
      element.offsetWidth - element.clientWidth - borderX > 1 ||
      element.offsetHeight - element.clientHeight - borderY > 1
    );
  };

  // A touch cannot pass its scrolling to the docs page like the wheel. On an
  // inactive page, the touch stops the scroll containers under it until it
  // ends, and the site stylesheet lets their overscroll reach the docs page.
  // The browser then scrolls the docs page, as it does over the stopped root.
  // Containers with a classic scrollbar keep scrolling under the touch.
  let scrollLocked: Element[] = [];
  window.addEventListener(
    "touchstart",
    (event) => {
      if (root.hasAttribute("data-preview-active")) return;
      for (const element of getScrollContainers(event.target)) {
        if (hasClassicScrollbar(element)) continue;
        element.setAttribute("data-preview-scroll-lock", "");
        scrollLocked.push(element);
      }
    },
    { capture: true, passive: true },
  );
  const unlockScroll = (event: TouchEvent) => {
    // Touches on the docs page can still be down. Chrome lists them with this
    // document as their target, and a touch in the page targets an element.
    for (const touch of event.touches) {
      if (touch.target instanceof Element && document.contains(touch.target)) {
        return;
      }
    }
    for (const element of scrollLocked) {
      element.removeAttribute("data-preview-scroll-lock");
    }
    scrollLocked = [];
  };
  window.addEventListener("touchend", unlockScroll, true);
  window.addEventListener("touchcancel", unlockScroll, true);

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
        opening,
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

  const setProperty = (property: string, value: string | null) => {
    if (value) {
      root.style.setProperty(property, value);
    } else {
      root.style.removeProperty(property);
    }
  };

  // Matches the theme script of the site, which reads the same values from
  // storage in same-origin previews.
  const applyTheme = (theme: object) => {
    const read = (key: string) => {
      const value: unknown = Reflect.get(theme, key);
      return typeof value === "string" ? value : null;
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
      case "activate":
        resized = true;
        updateActive();
        break;
      case "deactivate":
        resized = false;
        updateActive();
        break;
      case "theme":
        if ("theme" in data && data.theme && typeof data.theme === "object") {
          applyTheme(data.theme);
        }
        break;
      case "viewport":
        // The site stylesheet passes this value to app shells. Until it
        // arrives, each shell keeps the radius of its own size.
        if ("radius" in data && typeof data.radius === "string") {
          setProperty("--preview-viewport-radius", data.radius);
          root.toggleAttribute("data-preview-viewport-radius", !!data.radius);
        }
        break;
    }
  });

  const finishOpening = () => {
    if (!opening) return;
    opening = false;
    postLocation();
  };

  if (opening) {
    onHydrated(async () => {
      await openPopup();
      finishOpening();
    });
    // A page that fails to hydrate, such as one whose example throws, stops
    // waiting so the card shows it. A timer would also show a page that
    // hydrates slowly, which happens long after it loads on a slow network.
    window.addEventListener("astro:hydration-error", finishOpening);
    // Errors after hydration, such as a ResizeObserver loop while the popup
    // opens, do not end the wait before the page scrolls to the popup.
    window.addEventListener("error", () => {
      if (root.hasAttribute("data-preview-hydrated")) return;
      finishOpening();
    });
  }

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
    const opening: unknown = Reflect.get(data, "opening");
    if (opening !== undefined && typeof opening !== "boolean") return false;
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
