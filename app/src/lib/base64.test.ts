/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { expect, test } from "vitest";
import { decodeBase64, encodeBase64 } from "./base64.ts";

test("encodes and decodes UTF-8 strings", () => {
  const code = 'const label = "América 🌎";\n<Button>“Save”</Button>';

  expect(decodeBase64(encodeBase64(code))).toBe(code);
});
