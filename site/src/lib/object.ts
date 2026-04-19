/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
export function objectId(object: string | { id: string }) {
  return typeof object === "string" ? object : object.id;
}

export function keys<T extends Record<string, unknown>>(object: T) {
  return Object.keys(object) as [keyof T, ...(keyof T)[]];
}

export function nonNullable<T>(value: T) {
  return value != null;
}
