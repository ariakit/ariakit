/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { Buffer } from "node:buffer";

export function encodeBase64(value: string) {
  return Buffer.from(value, "utf8").toString("base64");
}

export function decodeBase64(value: string) {
  return Buffer.from(value, "base64").toString("utf8");
}
