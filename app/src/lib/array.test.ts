/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */

import { expect, expectTypeOf, test } from "vitest";
import { findInOrder } from "./array.ts";

interface Item {
  id: number;
  label: string | null;
}

const items: Item[] = [
  { id: 1, label: "one" },
  { id: 2, label: null },
];

test("findInOrder finds property values in order", () => {
  expect(findInOrder(items, "id", [2, 1])).toBe(items[1]);
  expect(findInOrder(items, "label", [null, "one"])).toBe(items[0]);
});

test("findInOrder preserves property and selector value types", () => {
  expectTypeOf(findInOrder(items, "id", [1])).toEqualTypeOf<Item | null>();
  expectTypeOf(
    findInOrder(items, (item) => item.label, ["one"]),
  ).toEqualTypeOf<Item | null>();

  const expectInvalidFindInOrderTypes = () => {
    // @ts-expect-error Invalid value for property key.
    findInOrder(items, "id", ["1"]);
    // @ts-expect-error Invalid value for selector.
    findInOrder(items, (item) => item.id, ["1"]);
  };

  expectTypeOf(expectInvalidFindInOrderTypes).toEqualTypeOf<() => void>();
});
