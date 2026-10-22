/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */

/**
 * A frame follows the card width again a little before it scrolls into view, so
 * its one catch-up layout happens offscreen.
 */
export const PREVIEW_FRAME_MARGIN = "200px";

interface PreviewFrameState {
  iframe: HTMLIFrameElement;
  /** Follows the card width. */
  stage: Element;
  stageWidth: number | null;
  /**
   * The width of the frame parent, which follows the stage, or the width that
   * the resize handle gives it.
   */
  viewportWidth: number | null;
  near: boolean;
  settleId: number;
  settling: boolean;
}

/**
 * Gives each preview frame on the page the width of its viewport, but keeps
 * that width while the frame is away from the screen and while its card changes
 * width, such as during a sidebar animation or a window resize. Each frame lays
 * out a full page, and a browser lays out a frame again on each step of a
 * resize, even offscreen. A frame takes the new width once the card keeps its
 * width for a whole frame. The resize handle changes only the viewport, so the
 * frame follows it right away.
 *
 * Cards hydrate as they come near the viewport, so this runs once for the page
 * and covers the frames of cards that have not hydrated yet.
 */
export function setupPreviewFrames() {
  const states = new Map<Element, PreviewFrameState>();

  const follow = (state: PreviewFrameState) => {
    if (!state.near) return;
    if (state.settling) return;
    if (state.viewportWidth == null) return;
    state.iframe.style.width = `${state.viewportWidth}px`;
  };

  // Frames take their new width after a resize one per animation frame, so
  // their layouts do not add up to one long frame.
  const queue = new Set<PreviewFrameState>();
  let flushing = false;
  const flush = () => {
    const [state] = queue;
    if (!state) {
      flushing = false;
      return;
    }
    queue.delete(state);
    follow(state);
    requestAnimationFrame(flush);
  };
  const enqueue = (state: PreviewFrameState) => {
    queue.add(state);
    if (flushing) return;
    flushing = true;
    requestAnimationFrame(flush);
  };

  // Each step of a resize restarts the wait. The second callback runs after a
  // whole frame, unless another step comes first.
  const settle = (state: PreviewFrameState) => {
    const settleId = ++state.settleId;
    state.settling = true;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (settleId !== state.settleId) return;
        state.settling = false;
        enqueue(state);
      });
    });
  };

  const intersectionObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const state = states.get(entry.target);
        if (!state) continue;
        state.near = entry.isIntersecting;
        follow(state);
      }
    },
    { rootMargin: PREVIEW_FRAME_MARGIN },
  );

  // The observer reports the stage and the viewport of a card together, so a
  // viewport change without a stage change comes from the resize handle.
  const resizeObserver = new ResizeObserver((entries) => {
    const resized = new Set<PreviewFrameState>();
    const pageResized = new Set<PreviewFrameState>();
    for (const entry of entries) {
      const state = states.get(entry.target);
      if (!state) continue;
      const width = entry.contentRect.width;
      if (entry.target === state.stage) {
        const previousWidth = state.stageWidth;
        state.stageWidth = width;
        // The first report is the initial size, not a resize.
        if (previousWidth != null && previousWidth !== width) {
          pageResized.add(state);
        }
      } else {
        state.viewportWidth = width;
        resized.add(state);
      }
    }
    for (const state of pageResized) {
      settle(state);
    }
    for (const state of resized) {
      follow(state);
    }
  });

  const iframes = document.querySelectorAll("iframe[data-preview-frame]");
  for (const iframe of iframes) {
    if (!(iframe instanceof HTMLIFrameElement)) continue;
    const stage = iframe.closest("[data-preview-stage]");
    const viewport = iframe.parentElement;
    if (!stage || !viewport) continue;
    const state: PreviewFrameState = {
      iframe,
      stage,
      stageWidth: null,
      viewportWidth: null,
      near: true,
      settleId: 0,
      settling: false,
    };
    states.set(iframe, state);
    states.set(stage, state);
    states.set(viewport, state);
    intersectionObserver.observe(iframe);
    resizeObserver.observe(stage);
    resizeObserver.observe(viewport);
  }
}
