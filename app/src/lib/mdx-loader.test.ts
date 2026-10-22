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
import { pathToFileURL } from "node:url";
import type { LoaderContext } from "astro/loaders";
import { afterEach, expect, test, vi } from "vitest";
import { recipeLoader } from "./mdx-loader.ts";

// The glob loader needs the Astro content runtime. This one parses the single
// recipe that the test writes, which is all the framework inference reads.
const globEntry = vi.hoisted(() => ({ filePath: "" }));

vi.mock("astro/loaders", () => ({
  glob: () => ({
    name: "glob",
    async load(context: LoaderContext) {
      await context.parseData({
        id: "recipe",
        data: {},
        filePath: globEntry.filePath,
      });
    },
  }),
}));

const dirs: string[] = [];

afterEach(async () => {
  for (const dir of dirs.splice(0)) {
    await fs.rm(dir, { force: true, recursive: true });
  }
});

async function writeMetadata(dir: string, frameworks: string[]) {
  const metadata = { title: "Recipe", frameworks };
  await fs.writeFile(join(dir, "preview.json"), JSON.stringify(metadata));
}

test("recipes reload when preview.json changes their frameworks", async () => {
  const base = await fs.mkdtemp(join(os.tmpdir(), "ariakit-mdx-loader-"));
  dirs.push(base);
  const dir = join(base, "recipe");
  await fs.mkdir(dir);
  await fs.writeFile(join(dir, "index.mdx"), "");
  await writeMetadata(dir, ["react"]);
  globEntry.filePath = join(dir, "index.mdx");

  const parseData = vi.fn(async (options: { data: unknown }) => options.data);
  const watcher = Object.assign(new EventEmitter(), { add: vi.fn() });
  const logger = { error: vi.fn() };
  const context = {
    config: { root: pathToFileURL(`${base}/`) },
    logger,
    parseData,
    store: { clear: vi.fn() },
    watcher,
  } as unknown as LoaderContext;

  await recipeLoader({ base }).load(context);
  expect(parseData).toHaveBeenLastCalledWith(
    expect.objectContaining({ data: { frameworks: ["react"] } }),
  );

  await writeMetadata(dir, ["react", "solid"]);
  watcher.emit("change", join(dir, "preview.json"));
  await expect
    .poll(() => parseData.mock.lastCall?.[0].data)
    .toEqual({ frameworks: ["react", "solid"] });
  expect(logger.error).not.toHaveBeenCalled();
});
