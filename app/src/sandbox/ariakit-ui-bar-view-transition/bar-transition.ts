/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { getDocument, getWindow } from "@ariakit/utils";

interface ViewTransitionScope extends Element {
  startViewTransition: Document["startViewTransition"];
}

// Scoped view transitions aren't in the DOM types yet.
function supportsScopedTransitions(
  element: Element,
): element is ViewTransitionScope {
  return (
    "startViewTransition" in element &&
    typeof element.startViewTransition === "function"
  );
}

// Updates wait for their transition to capture the old state. Until then, a
// newer update of the same group replaces the pending one in that transition. A
// new transition would skip the pending one, and browsers can then run the
// skipped update after the new one, which applies stale state.
const pendingUpdates = new WeakMap<
  Element | Document,
  { update: () => void }
>();

/**
 * Runs `update` in a view transition of the `bar` type, so the bar of a group
 * that sets `--bar-transition-name` moves from the old item to the new one. The
 * transition is scoped to `scope` where browsers support it, which keeps the
 * rest of the page live. Without view transitions, or with reduced motion,
 * `update` runs at once. `update` must change the DOM synchronously, such as
 * with `flushSync` in React. Calls for the same `scope` before the transition
 * runs its update share that transition, and only the last `update` runs.
 */
export function startBarTransition(
  scope: Element | null | undefined,
  update: () => void,
) {
  const doc = getDocument(scope);
  const win = getWindow(scope);
  const reducedMotion = win.matchMedia("(prefers-reduced-motion: reduce)");
  if (typeof doc.startViewTransition !== "function" || reducedMotion.matches) {
    update();
    return;
  }
  const group = scope ?? doc;
  const pending = pendingUpdates.get(group);
  if (pending) {
    pending.update = update;
    return;
  }
  const next = { update };
  pendingUpdates.set(group, next);
  const runUpdate = () => {
    pendingUpdates.delete(group);
    next.update();
  };
  const target = scope && supportsScopedTransitions(scope) ? scope : doc;
  target.startViewTransition({ update: runUpdate, types: ["bar"] });
}
