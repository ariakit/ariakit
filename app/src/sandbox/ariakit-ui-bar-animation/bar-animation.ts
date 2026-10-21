/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { getWindow } from "@ariakit/utils";

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface BarInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

interface BarMotion {
  bar: HTMLElement;
  animation: Animation;
  from: Box;
  to: Box;
}

// The attributes that the `ui-selected` variant reads. Checkedness changes
// without an attribute, so `change` events cover `:checked`.
const SELECTION_ATTRIBUTES = ["aria-checked", "aria-selected", "aria-current"];

const DEFAULT_DURATION = 250;

function getVisibleBar(group: Element) {
  for (const bar of group.querySelectorAll<HTMLElement>(".control-bar")) {
    if (bar.checkVisibility()) return bar;
  }
  return null;
}

function getBox(element: Element): Box {
  const { x, y, width, height } = element.getBoundingClientRect();
  return { x, y, width, height };
}

function getInsets(bar: Element): BarInsets | undefined {
  const item = bar.parentElement;
  if (!item) return;
  const barRect = bar.getBoundingClientRect();
  const itemRect = item.getBoundingClientRect();
  return {
    top: barRect.top - itemRect.top,
    right: itemRect.right - barRect.right,
    bottom: itemRect.bottom - barRect.bottom,
    left: barRect.left - itemRect.left,
  };
}

// A hidden bar has no box, but its item does. The bar sits at the same insets
// from its item as when it was last visible.
function getRestingBox(bar: Element, insets?: BarInsets): Box | undefined {
  const item = bar.parentElement;
  if (!item || !insets) return;
  if (!item.checkVisibility()) return;
  const rect = item.getBoundingClientRect();
  return {
    x: rect.left + insets.left,
    y: rect.top + insets.top,
    width: rect.width - insets.left - insets.right,
    height: rect.height - insets.top - insets.bottom,
  };
}

function interpolateBox(from: Box, to: Box, progress: number): Box {
  const mix = (start: number, end: number) => start + (end - start) * progress;
  return {
    x: mix(from.x, to.x),
    y: mix(from.y, to.y),
    width: mix(from.width, to.width),
    height: mix(from.height, to.height),
  };
}

function parseDuration(value: string) {
  const number = Number.parseFloat(value);
  if (Number.isNaN(number)) return DEFAULT_DURATION;
  if (value.trim().endsWith("ms")) return number;
  return number * 1000;
}

/**
 * Animates the bar of `group` from the previously selected item to the newly
 * selected one. Selection changes apply at once, and only the new bar's
 * transform animates, so input is never delayed or dropped. The animation reads
 * `--duration-bar` and `--ease-bar`, and is skipped with reduced motion.
 * Returns a function that stops observing the group.
 * @example
 * useEffect(() => animateBars(tabList), []);
 */
export function animateBars(group: HTMLElement) {
  const win = getWindow(group);
  const reducedMotion = win.matchMedia("(prefers-reduced-motion: reduce)");
  const insets = new WeakMap<Element, BarInsets>();
  let current = getVisibleBar(group);
  let motion: BarMotion | undefined;

  const saveInsets = (bar: Element) => {
    const barInsets = getInsets(bar);
    if (!barInsets) return;
    insets.set(bar, barInsets);
  };

  // A bar that is still moving starts the next move from where it is now.
  const getPreviousBox = (bar: HTMLElement) => {
    const progress = motion?.animation.effect?.getComputedTiming().progress;
    if (motion?.bar === bar && progress != null) {
      return interpolateBox(motion.from, motion.to, progress);
    }
    return getRestingBox(bar, insets.get(bar));
  };

  const update = () => {
    const previous = current;
    const next = getVisibleBar(group);
    current = next;
    if (!next) return;
    if (next === previous) return;
    const from = previous ? getPreviousBox(previous) : undefined;
    motion?.animation.cancel();
    motion = undefined;
    const to = getBox(next);
    saveInsets(next);
    if (!from) return;
    if (reducedMotion.matches) return;
    if (!to.width) return;
    if (!to.height) return;
    const style = win.getComputedStyle(next);
    const duration = parseDuration(style.getPropertyValue("--duration-bar"));
    const easing = style.getPropertyValue("--ease-bar").trim() || "ease";
    const translate = `translate(${from.x - to.x}px, ${from.y - to.y}px)`;
    const scale = `scale(${from.width / to.width}, ${from.height / to.height})`;
    const animation = next.animate(
      [
        { transformOrigin: "0 0", transform: `${translate} ${scale}` },
        { transformOrigin: "0 0", transform: "none" },
      ],
      { duration, easing },
    );
    motion = { bar: next, animation, from, to };
  };

  if (current) {
    saveInsets(current);
  }
  const observer = new win.MutationObserver(update);
  observer.observe(group, {
    subtree: true,
    attributeFilter: SELECTION_ATTRIBUTES,
  });
  group.addEventListener("change", update);

  return () => {
    observer.disconnect();
    group.removeEventListener("change", update);
    motion?.animation.cancel();
  };
}
