/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
export function findInOrder<T, Value>(
  array: T[],
  key: keyof T | ((item: T) => Value),
  values: Value[],
) {
  for (const value of values) {
    const item = array.find((item) => {
      if (value == null) return false;
      if (typeof key === "function") {
        return key(item) === value;
      }
      return item[key] === value;
    });
    if (item) return item;
  }
  return null;
}

export function uniq<T>(array: T[]) {
  return [...new Set(array)];
}
