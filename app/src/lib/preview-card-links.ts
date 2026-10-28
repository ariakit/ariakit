/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */

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

/**
 * Moves focus to a preview card when a link on the page goes to its section,
 * such as the title of the card or the table of contents, as a click on the
 * card does. So the preview scrolls and shows that it is active.
 *
 * Cards hydrate as they come near the viewport, so this runs once for the page
 * and covers cards that have not hydrated yet. They pick up the focus when they
 * hydrate.
 */
export function setupPreviewCardLinks() {
  document.addEventListener("click", (event) => {
    if (event.defaultPrevented) return;
    if (event.button !== 0) return;
    // Modifier keys open the link elsewhere, such as in a new tab.
    if (event.metaKey) return;
    if (event.ctrlKey) return;
    if (event.shiftKey) return;
    if (event.altKey) return;
    if (!(event.target instanceof Element)) return;
    const link = event.target.closest("a[href]");
    if (!(link instanceof HTMLAnchorElement)) return;
    const target = getLinkTarget(link);
    if (!target) return;
    const card = getCard(target);
    if (!card) return;
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
