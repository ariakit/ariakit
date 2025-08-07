/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function getRandomId(prefix = "id-") {
  return `${prefix}${Math.random().toString(36).substring(2, 15)}`;
}

export function trimLeft(str: string, chars: string) {
  return str.replace(new RegExp(`^[${chars}]+`), "");
}

export function trimRight(str: string, chars: string) {
  return str.replace(new RegExp(`[${chars}]+$`), "");
}

export function trim(str: string, chars: string) {
  return trimLeft(trimRight(str, chars), chars);
}

export function generateId(prefix = "ak-") {
  return `${prefix}${Math.random().toString(36).substring(2, 10)}`;
}
