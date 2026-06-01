/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import fs from "node:fs/promises";
import os from "node:os";
import { join } from "node:path";
import { afterEach, expect, test } from "vitest";
import { writePreviewCodegen } from "./preview-codegen.ts";
import { previewConfig } from "./preview-config.ts";
import { resolvePreviewRoots } from "./preview-discovery.ts";
import type { DiscoveredPreview } from "./preview-discovery.ts";
import { shouldRegeneratePreview } from "./preview-integration.ts";

const dirs: string[] = [];

afterEach(async () => {
  for (const dir of dirs.splice(0)) {
    await fs.rm(dir, { force: true, recursive: true });
  }
});

async function createDir() {
  const dir = await fs.mkdtemp(join(os.tmpdir(), "ariakit-preview-codegen-"));
  dirs.push(dir);
  return dir;
}

function getPreview(root: string): DiscoveredPreview {
  return {
    id: "menu",
    title: "Menu",
    source: "sandbox",
    frameworks: ["react"],
    entryFiles: {
      react: join(root, "sandbox/menu/index.react.tsx"),
    },
    metadata: {},
  };
}

test("tracks whether generated preview code changes", async () => {
  const dir = await createDir();
  const preview = getPreview(dir);

  const first = await writePreviewCodegen({
    codegenDir: join(dir, "codegen"),
    previews: [preview],
  });
  const second = await writePreviewCodegen({
    codegenDir: join(dir, "codegen"),
    previews: [preview],
  });

  expect(first.changed).toBe(true);
  expect(second.changed).toBe(false);
});

test("removes stale preview wrappers", async () => {
  const dir = await createDir();
  const codegenDir = join(dir, "codegen");
  const previewFile = join(codegenDir, "previews/menu/preview.astro");
  const contentFile = join(codegenDir, "previews/menu/preview.mdx");

  await writePreviewCodegen({
    codegenDir,
    previews: [getPreview(dir)],
  });
  const result = await writePreviewCodegen({ codegenDir, previews: [] });

  await expect(fs.access(previewFile)).rejects.toThrow();
  await expect(fs.access(contentFile)).rejects.toThrow();
  expect(result.changed).toBe(true);
});

test("generates deferred preview content modules", async () => {
  const dir = await createDir();
  const codegenDir = join(dir, "codegen");

  await writePreviewCodegen({
    codegenDir,
    previews: [getPreview(dir)],
  });

  const content = await fs.readFile(
    join(codegenDir, "previews/menu/preview.mdx"),
    "utf8",
  );
  expect(content).toMatchInlineSnapshot(`
    "import Preview from "./preview.astro";

    <Preview />
    "
  `);
});

test("regenerates previews only for structural files", async () => {
  const dir = await createDir();
  const srcDir = join(dir, "src");
  const roots = resolvePreviewRoots({ ...previewConfig, srcDir });

  expect(
    shouldRegeneratePreview(
      join(srcDir, "examples/menu/index.react.tsx"),
      roots,
    ),
  ).toBe(true);
  expect(
    shouldRegeneratePreview(join(srcDir, "examples/menu/preview.json"), roots),
  ).toBe(true);
  expect(
    shouldRegeneratePreview(join(srcDir, "examples/menu/style.css"), roots),
  ).toBe(false);
  expect(
    shouldRegeneratePreview(join(srcDir, "examples/menu/index.ts"), roots),
  ).toBe(false);
  expect(
    shouldRegeneratePreview(
      join(srcDir, "components/menu/preview.json"),
      roots,
    ),
  ).toBe(false);
});
