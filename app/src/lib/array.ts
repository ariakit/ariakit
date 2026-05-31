/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
export function findInOrder<T, K extends keyof T>(
  array: T[],
  key: K,
  values: T[K][],
): T | null;
export function findInOrder<T, Value>(
  array: T[],
  key: (item: T) => Value,
  values: Value[],
): T | null;
export function findInOrder<T>(
  array: T[],
  key: keyof T | ((item: T) => unknown),
  values: unknown[],
): T | null {
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
