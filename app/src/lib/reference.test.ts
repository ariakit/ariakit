/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */

import { decode } from "html-entities";
import { expect, test } from "vitest";
import { getReferenceCodeBlockHtml } from "./reference.ts";

function getCodeContent(html: string) {
  const match = html.match(/^<code[^>]*>([\s\S]*?)<\/code>$/);
  if (!match) {
    throw new Error(`Invalid code block HTML: ${html}`);
  }
  return match[1] ?? "";
}

test("getReferenceCodeBlockHtml preserves entity-like code text", () => {
  const code = [
    'fetch("/api?page=1&copy=2")',
    "<span>5 &times; 3</span>",
    "a &amp;&amp; b",
  ].join("\n");
  const html = getReferenceCodeBlockHtml({ code, language: "jsx" });

  expect(html).toContain('<code class="language-jsx">');
  expect(decode(getCodeContent(html))).toBe(code);
});
