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
import type { RefObject } from "react";

/**
 * The element that a measurement part measures: a ref, or a function for an
 * element that the subject creates itself, such as the box of a glider.
 */
export type MeasureTarget =
  | RefObject<HTMLElement | null>
  | (() => HTMLElement | null | undefined);

/** The colors of the measurement parts, so two parts can differ. */
export type MeasureTone = "brand" | "secondary";

// Full class names, so Tailwind finds them in the source.
export const toneClasses = {
  brand: {
    stroke: "stroke-brand",
    fill: "fill-brand",
    swatch: "bg-brand",
  },
  secondary: {
    stroke: "stroke-secondary",
    fill: "fill-secondary",
    swatch: "bg-secondary",
  },
} satisfies Record<MeasureTone, Record<string, string>>;

export function resolveTarget(target: MeasureTarget) {
  if (typeof target === "function") return target() ?? null;
  return target.current;
}

export interface MeasuredBox {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
  /**
   * The scale of the box on the screen, from a scale transform on the subject.
   * A value at 1× is a length on the screen divided by it.
   */
  scale: number;
  rtl: boolean;
}

/**
 * Reads the box of an element on the stage, in pixels of the stage, and the
 * scale that a transform gives it.
 */
export function measureBox(element: HTMLElement, stage: HTMLElement) {
  const rect = element.getBoundingClientRect();
  const style = getWindow(element).getComputedStyle(element);
  const stageRect = stage.getBoundingClientRect();
  // The parts draw in the padding box of the stage.
  const originX = stageRect.left + stage.clientLeft;
  const originY = stageRect.top + stage.clientTop;
  const box: MeasuredBox = {
    left: rect.left - originX,
    top: rect.top - originY,
    right: rect.right - originX,
    bottom: rect.bottom - originY,
    width: rect.width,
    height: rect.height,
    scale: getScale(element, style, rect.width),
    rtl: style.direction === "rtl",
  };
  return box;
}

// The layout width keeps its size under a transform. The computed width has the
// fractions that offsetWidth rounds off. With border-box sizing, which Tailwind
// sets on every element, it's the width of the border box.
function getScale(
  element: HTMLElement,
  style: CSSStyleDeclaration,
  screenWidth: number,
) {
  const width =
    style.boxSizing === "border-box"
      ? Number.parseFloat(style.width)
      : element.offsetWidth;
  if (!width) return 1;
  if (Number.isNaN(width)) return 1;
  return screenWidth / width;
}

/** Rounds a length to one decimal and adds its unit, such as `12px`. */
export function formatLength(value: number) {
  return `${Math.round(value * 10) / 10}px`;
}

/** Compares two plain objects of numbers, strings, and booleans. */
export function isShallowEqual<T extends object>(a: T | null, b: T | null) {
  if (a === b) return true;
  if (!a || !b) return false;
  return Object.keys(a).every((key) => {
    return Reflect.get(a, key) === Reflect.get(b, key);
  });
}
