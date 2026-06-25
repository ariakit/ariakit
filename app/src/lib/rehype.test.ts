/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import type { Element, Root } from "hast";
import { expect, test } from "vitest";
import { decodeBase64 } from "./base64.ts";
import { rehypePreviousCode } from "./rehype.ts";

function createCodeBlock(code: string, metastring?: string): Element {
  return {
    type: "element",
    tagName: "pre",
    properties: {},
    children: [
      {
        type: "element",
        tagName: "code",
        properties: { metastring },
        children: [{ type: "text", value: code }],
      },
    ],
  };
}

test("rehypePreviousCode encodes Unicode code blocks", () => {
  const previousCode = "const label = 'Before'; // Move → next";
  const nextCode = "const label = 'After';";
  const beforeBlock = createCodeBlock(previousCode, "previousCode");
  const afterBlock = createCodeBlock(nextCode);
  const tree: Root = {
    type: "root",
    children: [beforeBlock, afterBlock],
  };

  rehypePreviousCode()(tree);

  expect(tree.children).toEqual([afterBlock]);

  const codeNode = afterBlock.children[0];
  expect(codeNode?.type).toBe("element");
  if (codeNode?.type !== "element") return;

  const encodedPreviousCode = codeNode.properties.previousCode;
  expect(typeof encodedPreviousCode).toBe("string");
  if (typeof encodedPreviousCode !== "string") return;

  expect(decodeBase64(encodedPreviousCode)).toBe(previousCode);
});
