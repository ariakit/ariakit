/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */

// The code label in browser chrome shows from this bar width, in rem.
const CODE_LABEL_MIN_WIDTH = 32;

/**
 * Marks the top bar of each browser preview card with `data-narrow` while the
 * bar is narrower than 32rem, so the code label hides and the address keeps its
 * room. A size container query on the bar would flip under the subgrids of the
 * page shell, and Chrome lays out the nested grids around the card again for
 * each flip. Chrome also lays out the bar at the width of the frame while it
 * measures the card. While the frame and the card are on different sides of
 * 32rem, the query then flips on every relayout, and a shell panel that opens
 * could take over a second of layout.
 * https://issues.chromium.org/issues/578117951
 *
 * Cards hydrate as they come near the viewport, so this runs once for the page
 * and covers the bars of cards that have not hydrated yet.
 */
export function setupPreviewCardBars() {
  const observer = new ResizeObserver((entries) => {
    const { fontSize } = getComputedStyle(document.documentElement);
    const minWidth = CODE_LABEL_MIN_WIDTH * Number.parseFloat(fontSize);
    for (const entry of entries) {
      const narrow = entry.contentRect.width < minWidth;
      entry.target.toggleAttribute("data-narrow", narrow);
    }
  });
  for (const bar of document.querySelectorAll("[data-preview-bar]")) {
    observer.observe(bar);
  }
}
