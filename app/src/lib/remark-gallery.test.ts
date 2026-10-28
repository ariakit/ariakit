/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { join } from "node:path";
import { unified } from "@astrojs/markdown-remark";
import { expect, test } from "vitest";
import { previewConfig } from "./preview-config.ts";
import { resolvePreviewRoots } from "./preview-discovery.ts";
import { remarkGalleryExamples } from "./remark-gallery.ts";

const srcDir = join(import.meta.dirname, "..");
const roots = resolvePreviewRoots({ ...previewConfig, srcDir });
const tooltipGallery = join(srcDir, "recipes/tooltip/gallery.mdx");

// Compiles the MDX through the processor that the app uses for content.
async function compile(content: string, filePath = tooltipGallery) {
  const processor = unified({
    remarkPlugins: [[remarkGalleryExamples, { roots, srcDir }]],
  });
  const renderer = await processor.createMdxRenderer?.({}, { optimize: false });
  if (!renderer) throw new Error("The processor renders no MDX");
  const { code } = await renderer.process(content, filePath, {});
  return code;
}

// The compiled code prints the frontmatter object over several lines.
function getFrontmatter(code: string) {
  const json = code.match(/export const frontmatter = ([\s\S]+?);\n/)?.[1];
  if (!json) throw new Error("The compiled MDX exports no frontmatter");
  return JSON.parse(json);
}

test("lists the previews of the gallery cards in page order", async () => {
  const code = await compile(`
import PreviewCard from "#app/components/preview-card.astro";
import PreviewGrid from "#app/components/preview-grid.astro";
import { source as s0 } from "./preview.astro";
import P1, { source as s1 } from "./shortcuts/preview.astro";
import { source as s2 } from "#app/recipes/combobox-group/preview.astro";
import s3 from "nextjs/pages/tab-nextjs?source";

<PreviewGrid>
  <PreviewCard source={s1}>
    <P1 />
  </PreviewCard>
  <PreviewCard source={s0} />
  <PreviewCard source={s2} />
  <PreviewCard source={s3} />
</PreviewGrid>
`);
  expect(getFrontmatter(code)).toEqual({
    examples: ["tooltip/shortcuts", "tooltip", "combobox-group", "tab-nextjs"],
  });
  expect(code.match(/gallery: true/g)).toHaveLength(4);
});

test("reads galleries with Windows paths", async () => {
  const code = await compile(
    `
import PreviewCard from "#app/components/preview-card.astro";
import s0 from "nextjs/pages/tab-nextjs?source";

<PreviewCard source={s0} />
`,
    "C:\\ariakit\\app\\src\\recipes\\tab-nextjs\\gallery.mdx",
  );
  expect(getFrontmatter(code)).toEqual({ examples: ["tab-nextjs"] });
});

test("fails on a card without a source import", async () => {
  await expect(
    compile(`
import PreviewCard from "#app/components/preview-card.astro";
import { source as react } from "./react/preview.astro";

<PreviewCard source={{ react }} />
`),
  ).rejects.toThrow(/A gallery card needs a source import/);
});

test("leaves cards outside galleries alone", async () => {
  const code = await compile(
    `
import PreviewCard from "#app/components/preview-card.astro";
import { source as s0 } from "#app/recipes/combobox-group/preview.astro";

<PreviewCard source={s0} />
`,
    join(srcDir, "guides/ariakit-react/1-getting-started.mdx"),
  );
  expect(getFrontmatter(code)).toEqual({});
  expect(code).not.toMatch(/gallery: true/);
});

test("fails on a card whose preview it cannot find", async () => {
  await expect(
    compile(`
import PreviewCard from "#app/components/preview-card.astro";
import source from "some-package";

<PreviewCard source={source} />
`),
  ).rejects.toThrow(/Cannot find the preview of source/);
});
