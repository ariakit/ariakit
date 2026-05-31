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
 * Returns the first item whose property value matches a value in `values`.
 *
 * Values are tried in order, so the match for the earliest value wins.
 * `null` and `undefined` values are skipped.
 */
export function findInOrder<T, K extends keyof T>(
  array: T[],
  key: K,
  values: T[K][],
): T | null;
/**
 * Returns the first item whose selected value matches a value in `values`.
 *
 * Values are tried in order, so the match for the earliest value wins.
 * `null` and `undefined` values are skipped.
 */
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
