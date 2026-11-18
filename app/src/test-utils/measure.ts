/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import type { Locator } from "@playwright/test";
import { expect } from "@playwright/test";

/**
 * The item of a measurement part in the legend of a figure, such as `Outer
 * radius: 18px`.
 */
export function getMeasureLabel(scope: Locator, name: string) {
  return scope.locator("[data-measure-label]").filter({ hasText: `${name}:` });
}

/** The center of the circle of a `Radius` part, on the screen. */
export async function getRadiusCenter(scope: Locator, name: string) {
  const dot = scope.locator(
    `svg[data-measure="${name}"] [data-measure-center]`,
  );
  const box = await dot.boundingBox();
  if (!box) throw new Error(`The radius ${name} has no center`);
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

/** Reads a computed length of an element, such as `padding-top`, in pixels. */
export async function getComputedLength(element: Locator, property: string) {
  const value = await element.evaluate(
    (node, name) => getComputedStyle(node).getPropertyValue(name),
    property,
  );
  return Number.parseFloat(value);
}

/**
 * Waits for a measurement label to show a length. The figure rounds lengths to
 * one decimal.
 */
export async function expectMeasure(
  scope: Locator,
  name: string,
  length: number,
) {
  const value = Math.round(length * 10) / 10;
  await expect(getMeasureLabel(scope, name)).toHaveText(`${name}: ${value}px`);
}
