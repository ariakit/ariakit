/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */

declare global {
  interface Window {
    /**
     * The last click on the page before its scripts run. Links work while the
     * page parses, so the layout records it for `setupPreviewCardLinks`.
     */
    appEarlyClick?: MouseEvent;
  }
}

// Returns the element that a same-page link points to, if any.
function getLinkTarget(link: HTMLAnchorElement) {
  if (link.pathname !== window.location.pathname) return null;
  let id = link.hash.slice(1);
  try {
    id = decodeURIComponent(id);
  } catch {
    // Keep a malformed hash as written, like the browser does.
  }
  if (!id) return null;
  return document.getElementById(id);
}

// Returns the preview card in the section that the title of the card labels.
function getCard(section: HTMLElement) {
  const headingId = section.getAttribute("aria-labelledby");
  if (!headingId) return null;
  const heading = document.getElementById(headingId);
  const card = heading?.closest("[data-preview-card]");
  if (!(card instanceof HTMLElement)) return null;
  if (!section.contains(card)) return null;
  return card;
}

// Returns the link, its section, and the preview card in the section, if the
// click goes to a preview card.
function getClickedCard(event: MouseEvent) {
  if (event.defaultPrevented) return null;
  if (event.button !== 0) return null;
  // Modifier keys open the link elsewhere, such as in a new tab.
  if (event.metaKey) return null;
  if (event.ctrlKey) return null;
  if (event.shiftKey) return null;
  if (event.altKey) return null;
  if (!(event.target instanceof Element)) return null;
  const link = event.target.closest("a[href]");
  if (!(link instanceof HTMLAnchorElement)) return null;
  const target = getLinkTarget(link);
  if (!target) return null;
  const card = getCard(target);
  if (!card) return null;
  return { link, target, card };
}

/**
 * Moves focus to a preview card when a link on the page goes to its section,
 * such as the title of the card or the table of contents, as a click on the
 * card does. So the preview scrolls and shows that it is active.
 *
 * Cards hydrate as they come near the viewport, so this runs once for the page
 * and covers cards that have not hydrated yet. They pick up the focus when they
 * hydrate. It also covers a link clicked before it runs, which the layout
 * records.
 */
export function setupPreviewCardLinks() {
  let earlyClick = window.appEarlyClick;
  // Chrome and Safari scroll to the hash again when the page finishes parsing,
  // which clears focus. So a link clicked before this ran moves focus on load.
  window.addEventListener(
    "load",
    () => {
      if (!earlyClick) return;
      const clicked = getClickedCard(earlyClick);
      if (!clicked) return;
      // The hash can change again, such as with the back button.
      if (clicked.link.hash !== window.location.hash) return;
      const { activeElement } = document;
      // Firefox keeps focus on the link when its section hasn't loaded yet.
      const focusStayed =
        activeElement === document.body || activeElement === clicked.link;
      // Focus can move elsewhere after the click, such as with the Tab key.
      if (!focusStayed) return;
      clicked.card.focus({ preventScroll: true });
    },
    { once: true },
  );
  document.addEventListener("click", (event) => {
    // The person moved on from the link clicked before this ran.
    earlyClick = undefined;
    const clicked = getClickedCard(event);
    if (!clicked) return;
    const { link, target, card } = clicked;
    const focusCard = () => card.focus({ preventScroll: true });
    // The link scrolls to the section after the click and clears focus, even
    // for the current hash. Firefox does it later than the next task, and only
    // a new hash reports when it's done. So a link to the current hash scrolls
    // here instead, which also follows the scroll margin.
    if (link.hash === window.location.hash) {
      event.preventDefault();
      target.scrollIntoView();
      focusCard();
      return;
    }
    const onHashChange = () => {
      if (window.location.hash !== link.hash) return;
      focusCard();
    };
    window.addEventListener("hashchange", onHashChange, { once: true });
  });
}
