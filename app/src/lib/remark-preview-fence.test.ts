/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { unified } from "@astrojs/markdown-remark";
import { expect, test } from "vitest";
import { remarkPreviewFences } from "./remark-preview-fence.ts";

const mdxPath = "/app/src/docs/styles/utilities/ak-layer/index.mdx";

// Compiles the MDX through the processor that the app uses for content, and
// returns the JSX runtime calls of the content.
async function compile(content: string, filePath = mdxPath) {
  const processor = unified({ remarkPlugins: [remarkPreviewFences] });
  const renderer = await processor.createMdxRenderer?.({}, { optimize: false });
  if (!renderer) throw new Error("The processor renders no MDX");
  const { code } = await renderer.process(content, filePath, {});
  return code;
}

const fence = [
  "```html preview",
  '<div class="ak-layer ak-frame-card/card">Card</div>',
  "```",
].join("\n");

test("renders an html preview fence as an example card with its code", async () => {
  const code = await compile(fence);
  expect(code).toContain("_jsx(ExampleCard, {");
  expect(code).toContain(
    'html: "<div class=\\"ak-layer ak-frame-card/card\\">Card</div>"',
  );
  // The code of the fence stays in the card, without the preview word.
  expect(code).toContain('class: "language-html"');
  expect(code).not.toContain("preview");
});

test("keeps the other words of the info string", async () => {
  const code = await compile(
    fence.replace("html preview", "html preview title"),
  );
  expect(code).toContain("_jsx(ExampleCard, {");
  expect(code).toContain('metastring: "title"');
});

test("leaves other fences as code", async () => {
  const code = await compile(
    [
      "```html",
      "<div>Card</div>",
      "```",
      "",
      "```css preview",
      "a {}",
      "```",
    ].join("\n"),
  );
  expect(code).not.toContain("ExampleCard");
});

test("leaves html preview fences in plain Markdown files as code", async () => {
  const code = await compile(fence, "/app/src/readme.md");
  expect(code).not.toContain("ExampleCard");
});
