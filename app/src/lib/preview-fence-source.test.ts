/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { EventEmitter } from "node:events";
import fs from "node:fs/promises";
import os from "node:os";
import { join } from "node:path";
import { unified } from "@astrojs/markdown-remark";
import { visit } from "unist-util-visit";
import { afterEach, expect, test, vi } from "vitest";
import {
  getPreviewFenceMarkup,
  watchPreviewFenceSource,
  writePreviewFenceSource,
} from "./preview-fence-source.ts";
import { remarkPreviewFences } from "./remark-preview-fence.ts";

const stylesDir = join(import.meta.dirname, "../docs/styles");

const dirs: string[] = [];

afterEach(async () => {
  for (const dir of dirs.splice(0)) {
    await fs.rm(dir, { force: true, recursive: true });
  }
});

async function createDir() {
  const dir = await fs.mkdtemp(join(os.tmpdir(), "ariakit-preview-fences-"));
  dirs.push(dir);
  return dir;
}

interface JsxNode {
  type: string;
  name?: string | null;
  attributes?: { name?: string; value?: unknown }[];
}

function getAttribute(node: JsxNode, ...names: string[]) {
  return node.attributes?.find((attribute) => {
    return attribute.name != null && names.includes(attribute.name);
  });
}

// Compiles the MDX through the processor that the app uses for content. Returns
// the markup that the preview fence plugin gives to each example card, and the
// names of the JSX elements that have a class attribute.
async function compilePage(content: string, filePath: string) {
  const examples: string[] = [];
  const classElements: string[] = [];
  const collectJsx = () => (tree: Parameters<typeof visit>[0]) => {
    visit(tree, (node: JsxNode) => {
      if (!node.type.startsWith("mdxJsx")) return;
      if (getAttribute(node, "class", "className")) {
        classElements.push(node.name ?? "");
      }
      if (node.name !== "ExampleCard") return;
      const html = getAttribute(node, "html");
      if (typeof html?.value !== "string") return;
      examples.push(html.value);
    });
  };
  const processor = unified({
    remarkPlugins: [remarkPreviewFences, collectJsx],
  });
  const renderer = await processor.createMdxRenderer?.({}, { optimize: false });
  if (!renderer) throw new Error("The processor renders no MDX");
  await renderer.process(content, filePath, {});
  return { examples, classElements };
}

test("returns the markup of the html preview fences only", () => {
  const content = [
    "Text with `text-inline` code.",
    "",
    "```html preview",
    '<div class="text-live">Live</div>',
    "```",
    "",
    "```html",
    '<div class="text-sample">Sample</div>',
    "```",
    "",
    "```css preview",
    ".text-css {}",
    "```",
    "",
    "```html wrap preview maxLines=4",
    '<div class="text-options">Options</div>',
    "```",
  ].join("\n");
  expect(getPreviewFenceMarkup(content)).toBe(
    [
      '<div class="text-live">Live</div>',
      '<div class="text-options">Options</div>',
    ].join("\n"),
  );
});

test("ignores the preview word in quoted text", () => {
  const content = [
    '```html title="A preview card"',
    '<div class="text-sample">Sample</div>',
    "```",
  ].join("\n");
  expect(getPreviewFenceMarkup(content)).toBe("");
});

test("keeps a fence open until a closing line of its own length", () => {
  const content = [
    "~~~~html preview",
    "```",
    "~~~",
    '<div class="text-live">Live</div>',
    "~~~~",
    '<div class="text-after">After</div>',
  ].join("\n");
  expect(getPreviewFenceMarkup(content)).toBe(
    ["```", "~~~", '<div class="text-live">Live</div>'].join("\n"),
  );
});

test("reads a preview fence inside another fence", () => {
  const content = [
    "````md",
    "```html preview",
    '<div class="text-sample">Sample</div>',
    "```",
    "````",
  ].join("\n");
  expect(getPreviewFenceMarkup(content)).toBe(
    '<div class="text-sample">Sample</div>',
  );
});

test("reads a preview fence after a line that starts with inline code", () => {
  const content = [
    "```text-inline``` starts this paragraph.",
    "",
    "```html preview",
    '<div class="text-live">Live</div>',
    "```",
  ].join("\n");
  expect(getPreviewFenceMarkup(content)).toBe(
    '<div class="text-live">Live</div>',
  );
});

test("reads the fences of a file with CRLF line endings", () => {
  const content = [
    "```html preview",
    '<div class="text-live">Live</div>',
    "```",
    "",
  ].join("\r\n");
  expect(getPreviewFenceMarkup(content)).toBe(
    '<div class="text-live">Live</div>',
  );
});

test("reads the fences in a list item and in a block quote", () => {
  const content = [
    "1. Step",
    "",
    "   ```html preview",
    '   <div class="text-list">List</div>',
    "   ```",
    "",
    "- ```html preview",
    '  <div class="text-marker">Marker</div>',
    "  ```",
    "",
    "> ```html preview",
    '> <div class="text-quote">Quote</div>',
    "> ```",
  ].join("\n");
  expect(getPreviewFenceMarkup(content)).toBe(
    [
      '   <div class="text-list">List</div>',
      '  <div class="text-marker">Marker</div>',
      '> <div class="text-quote">Quote</div>',
    ].join("\n"),
  );
});

test("writes the markup of each file and tracks whether it changes", async () => {
  const dir = await createDir();
  const file = join(dir, "codegen/preview-fences.html");
  const fence = ["```html preview", '<div class="text-live"></div>', "```"];
  await fs.mkdir(join(dir, "pages/nested"), { recursive: true });
  await fs.writeFile(join(dir, "pages/nested/index.mdx"), fence.join("\n"));
  await fs.writeFile(join(dir, "pages/empty.mdx"), "No `text-sample` fence.");
  await fs.writeFile(join(dir, "pages/other.md"), fence.join("\n"));
  const params = { dir: join(dir, "pages"), file };

  expect(await writePreviewFenceSource(params)).toBe(true);
  expect(await writePreviewFenceSource(params)).toBe(false);
  expect(await fs.readFile(file, "utf8")).toBe(
    '<!-- nested/index.mdx -->\n<div class="text-live"></div>\n',
  );

  await fs.rm(join(dir, "pages/nested/index.mdx"));
  expect(await writePreviewFenceSource(params)).toBe(true);
  expect(await fs.readFile(file, "utf8")).toBe("");
});

test("writes the source again when an MDX file changes, also after a failed write", async () => {
  const dir = await createDir();
  const pagesDir = join(dir, "pages");
  const codegenDir = join(dir, "codegen");
  const file = join(codegenDir, "preview-fences.html");
  const page = join(pagesDir, "index.mdx");
  const fence = ["```html preview", '<div class="text-live"></div>', "```"];
  await fs.mkdir(pagesDir);
  await fs.writeFile(page, fence.join("\n"));
  const watcher = new EventEmitter();
  const errors: unknown[] = [];
  watchPreviewFenceSource({
    dir: pagesDir,
    file,
    watcher,
    onError: (error) => errors.push(error),
  });

  // A file in the place of the codegen directory makes the write fail.
  await fs.writeFile(codegenDir, "");
  watcher.emit("change", page);
  await vi.waitFor(() => expect(errors).toHaveLength(1));

  await fs.rm(codegenDir);
  watcher.emit("change", page);
  await vi.waitFor(async () => {
    expect(await fs.readFile(file, "utf8")).toContain("text-live");
  });
  expect(errors).toHaveLength(1);
});

// Tailwind scans the generated source instead of the Styles pages, so a live
// example that the source misses renders without its utilities. The source
// reads the fences from the text, and the pages render them from the MDX tree.
test("has the markup of each live example of the Styles pages", async () => {
  const paths = await Array.fromAsync(fs.glob("**/*.mdx", { cwd: stylesDir }));
  let exampleCount = 0;
  for (const path of paths) {
    const filePath = join(stylesDir, path);
    const content = await fs.readFile(filePath, "utf8");
    const sourceLines = getPreviewFenceMarkup(content).split("\n");
    const { examples } = await compilePage(content, filePath);
    exampleCount += examples.length;
    // The MDX tree keeps the line endings of the file, and the source has none.
    const lines = examples.flatMap((example) => example.split(/\r?\n/));
    for (const line of lines) {
      // The source keeps the container prefix that the MDX tree drops.
      const sourceLine = sourceLines.find((item) => item.endsWith(line));
      expect(sourceLine, `${path}: ${line}`).toBeDefined();
    }
  }
  // The loop asserts nothing if the pages have no live example.
  expect(exampleCount).toBeGreaterThan(0);
});

// Tailwind does not scan the Styles pages, so it compiles no utility for a
// class that an element in their MDX names. That markup belongs in an html
// preview fence or in a component file.
test("the Styles pages have no element with a class in their MDX", async () => {
  const paths = await Array.fromAsync(fs.glob("**/*.mdx", { cwd: stylesDir }));
  for (const path of paths) {
    const filePath = join(stylesDir, path);
    const content = await fs.readFile(filePath, "utf8");
    const { classElements } = await compilePage(content, filePath);
    expect(classElements, path).toEqual([]);
  }
});
