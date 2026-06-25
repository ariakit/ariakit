/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import type { Element, ElementContent, Root } from "hast";
import { expect, test } from "vitest";
import { decodeBase64 } from "./base64.ts";
import { rehypeAdmonitions, rehypePreviousCode } from "./rehype.ts";

function createParagraph(children: ElementContent[]): Element {
  return {
    type: "element",
    tagName: "p",
    properties: {},
    children,
  };
}

function createBlockquote(children: ElementContent[]): Element {
  return {
    type: "element",
    tagName: "blockquote",
    properties: {},
    children,
  };
}

function createText(value: string): ElementContent {
  return { type: "text", value };
}

function createBreak(): Element {
  return {
    type: "element",
    tagName: "br",
    properties: {},
    children: [],
  };
}

function createInlineCode(value: string): Element {
  return {
    type: "element",
    tagName: "code",
    properties: {},
    children: [createText(value)],
  };
}

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

test("rehypeAdmonitions preserves canonical single-paragraph bodies", () => {
  const blockquote = createBlockquote([
    createParagraph([createText("[!NOTE]\nUseful information.")]),
  ]);
  const tree: Root = {
    type: "root",
    children: [blockquote],
  };

  rehypeAdmonitions()(tree);

  expect(blockquote).toEqual({
    type: "element",
    tagName: "admonition",
    properties: { type: "note" },
    children: [createParagraph([createText("Useful information.")])],
  });
});

test("rehypeAdmonitions preserves hard-break paragraph bodies", () => {
  const blockquote = createBlockquote([
    createParagraph([
      createText("[!NOTE]"),
      createBreak(),
      createText("\nUseful information."),
    ]),
  ]);
  const tree: Root = {
    type: "root",
    children: [blockquote],
  };

  rehypeAdmonitions()(tree);

  expect(blockquote).toEqual({
    type: "element",
    tagName: "admonition",
    properties: { type: "note" },
    children: [createParagraph([createText("Useful information.")])],
  });
});

test("rehypeAdmonitions preserves two-paragraph title behavior", () => {
  const body = createParagraph([createText("Useful information.")]);
  const blockquote = createBlockquote([
    createParagraph([createText("[!TIP] A tip for you")]),
    body,
  ]);
  const tree: Root = {
    type: "root",
    children: [blockquote],
  };

  rehypeAdmonitions()(tree);

  expect(blockquote).toEqual({
    type: "element",
    tagName: "admonition",
    properties: { type: "tip", title: "A tip for you" },
    children: [body],
  });
});

test("rehypeAdmonitions preserves two-paragraph titleless behavior", () => {
  const body = createParagraph([createText("Useful information.")]);
  const blockquote = createBlockquote([
    createParagraph([createText("[!NOTE]")]),
    body,
  ]);
  const tree: Root = {
    type: "root",
    children: [blockquote],
  };

  rehypeAdmonitions()(tree);

  expect(blockquote).toEqual({
    type: "element",
    tagName: "admonition",
    properties: { type: "note" },
    children: [body],
  });
});

test("rehypeAdmonitions reads inline code titles from the first line", () => {
  const blockquote = createBlockquote([
    createParagraph([
      createText("[!WARNING] Do not use "),
      createInlineCode("foo"),
      createText(" selectors\nUse a class instead."),
    ]),
  ]);
  const tree: Root = {
    type: "root",
    children: [blockquote],
  };

  rehypeAdmonitions()(tree);

  expect(blockquote).toEqual({
    type: "element",
    tagName: "admonition",
    properties: { type: "warning", title: "Do not use foo selectors" },
    children: [createParagraph([createText("Use a class instead.")])],
  });
});

test("rehypeAdmonitions leaves non-admonition blockquotes untouched", () => {
  const paragraph = createParagraph([
    createText("Not an admonition\nStill body"),
  ]);
  const blockquote = createBlockquote([paragraph]);
  const expected = structuredClone(blockquote);
  const tree: Root = {
    type: "root",
    children: [blockquote],
  };

  rehypeAdmonitions()(tree);

  expect(blockquote).toEqual(expected);
});
