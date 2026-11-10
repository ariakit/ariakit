/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parseFrontmatter } from "@astrojs/markdown-remark";
import { expect, test } from "vitest";
import { compareNavigationOrder } from "./content.ts";
import { resolvePreviewFrameworks } from "./preview-discovery.ts";
import { RECIPE_CATEGORIES } from "./schemas.ts";

// The collections, such as /react/recipes/, have no pages. Cloudflare serves
// public/_redirects before the app, and it sends their paths to the first entry
// of the site navigation. These tests fail when a new entry comes first, so the
// targets don't go stale.

const appDir = join(import.meta.dirname, "../..");

const collections = [
  { type: "recipes", dir: "src/recipes" },
  { type: "components", dir: "src/component-docs" },
] as const;

interface Redirect {
  target: string;
  status: string;
}

function readRedirects() {
  const file = readFileSync(join(appDir, "public/_redirects"), "utf8");
  const redirects = new Map<string, Redirect>();
  for (const line of file.split("\n")) {
    const [source, target, status] = line.trim().split(/\s+/);
    if (!source || !target || !status) continue;
    redirects.set(source, { target, status });
  }
  return redirects;
}

// Reads the entries of a collection like its content loader does: the
// frontmatter of each index.mdx, and the frameworks of the entry files.
async function readEntries(dir: string) {
  const root = join(appDir, dir);
  const folders = readdirSync(root, { withFileTypes: true }).filter(
    (folder) =>
      folder.isDirectory() && existsSync(join(root, folder.name, "index.mdx")),
  );
  return Promise.all(
    folders.map(async (folder) => {
      const folderPath = join(root, folder.name);
      const source = readFileSync(join(folderPath, "index.mdx"), "utf8");
      const { frontmatter } = parseFrontmatter(source);
      const category = RECIPE_CATEGORIES.find(
        (category) => category === frontmatter.category,
      );
      return {
        id: folder.name,
        title: String(frontmatter.title),
        category,
        frameworks: await resolvePreviewFrameworks(folderPath, folder.name),
      };
    }),
  );
}

async function getCollectionRedirects() {
  const redirects = new Map<string, string>();
  for (const { type, dir } of collections) {
    const entries = await readEntries(dir);
    const frameworks = new Set(entries.flatMap((entry) => entry.frameworks));
    for (const framework of frameworks) {
      const [first] = entries
        .filter((entry) => entry.frameworks.includes(framework))
        .toSorted(compareNavigationOrder);
      if (!first) continue;
      const path = `/${framework}/${type}`;
      redirects.set(path, `${path}/${first.id}/`);
    }
  }
  return redirects;
}

test("collection paths redirect to the first entry of the site navigation", async () => {
  const redirects = readRedirects();
  const collectionRedirects = await getCollectionRedirects();
  expect(collectionRedirects.size).toBeGreaterThan(0);
  for (const [path, target] of collectionRedirects) {
    expect(redirects.get(path), path).toEqual({ target, status: "301" });
    expect(redirects.get(`${path}/`), `${path}/`).toEqual({
      target,
      status: "301",
    });
  }
});

// Cloudflare matches static rules by the exact path first. A splat rule, such
// as /examples/*, also matches its own path with a slash and an empty splat.
function getReachedTarget(redirects: Map<string, Redirect>, path: string) {
  const rule = redirects.get(path);
  if (rule) return rule.target;
  for (const [source, { target }] of redirects) {
    if (!source.endsWith("/*")) continue;
    const prefix = source.slice(0, -1);
    if (!path.startsWith(prefix)) continue;
    return target.replace(":splat", path.slice(prefix.length));
  }
  return;
}

test("no redirect goes through a collection path", async () => {
  const redirects = readRedirects();
  const collectionRedirects = await getCollectionRedirects();
  const collectionPaths = new Set(
    [...collectionRedirects.keys()].flatMap((path) => [path, `${path}/`]),
  );
  const sources = [...redirects.keys()].map((source) =>
    source.endsWith("/*") ? source.slice(0, -1) : source,
  );
  for (const source of sources) {
    if (collectionPaths.has(source)) continue;
    const target = getReachedTarget(redirects, source);
    expect(collectionPaths.has(target ?? ""), source).toBe(false);
  }
});
