/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test } from "vitest";
import checkboxCardForm from "#app/examples/checkbox-card/form/index.react.tsx?source";
import disclosureActions from "#app/examples/disclosure/actions/index.react.tsx?source";
import disclosure from "#app/examples/disclosure/index.react.tsx?source";
import { sourcePlugin } from "./source-plugin.ts";
import type { Source } from "./source.ts";

const EXAMPLES_DIR = join(import.meta.dirname, "../examples/");

function normalizeSourcePath(path: string) {
  return path.replace(EXAMPLES_DIR, "");
}

async function loadSourceFile(file: string) {
  const plugin = sourcePlugin();
  if (typeof plugin.load !== "function") {
    throw new TypeError("Expected source plugin load hook");
  }
  const code = await Reflect.apply(plugin.load, { addWatchFile() {} }, [
    `${file}?source`,
  ]);
  if (typeof code !== "string") {
    throw new TypeError("Expected source plugin output");
  }
  return JSON.parse(code.replace(/^export default /, "")) as Source;
}

test("disclosure name", () => {
  expect(disclosure.name).toBe("disclosure");
});

test("disclosure dependencies", () => {
  expect(Object.keys(disclosure.dependencies)).toMatchInlineSnapshot(`
    [
      "react",
      "react-dom",
      "@ariakit/ui",
    ]
  `);
});

test("disclosure dev dependencies", () => {
  expect(Object.keys(disclosure.devDependencies)).toMatchInlineSnapshot(`
    [
      "@types/react",
      "@types/react-dom",
    ]
  `);
});

test("disclosure file names", () => {
  expect(Object.keys(disclosure.files)).toMatchInlineSnapshot(`
    [
      "index.tsx",
    ]
  `);
});

test("cached flattened files use the current source base directory", async () => {
  const root = await mkdtemp(join(tmpdir(), "ariakit-source-plugin-"));
  const parentFile = join(root, "page.tsx");
  const nestedDir = join(root, "nested");
  const nestedFile = join(nestedDir, "page.tsx");

  try {
    await mkdir(nestedDir);
    await writeFile(parentFile, "export default function Page() {}");
    await writeFile(nestedFile, "export default function Page() {}");

    const parent = await loadSourceFile(parentFile);
    const nested = await loadSourceFile(nestedFile);

    expect(Object.keys(parent.files)).toEqual(["page.tsx", "nested/page.tsx"]);
    expect(Object.keys(nested.files)).toEqual(["page.tsx"]);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("disclosure source names", () => {
  const sourceKeys = Object.keys(disclosure.sources).map(normalizeSourcePath);
  expect(sourceKeys).toMatchInlineSnapshot(`
    [
      "disclosure/index.react.tsx",
    ]
  `);
});

test("disclosure actions source names include _lib data", () => {
  const sourceKeys = Object.keys(disclosureActions.sources).map(
    normalizeSourcePath,
  );
  expect(sourceKeys).toMatchInlineSnapshot(`
    [
      "disclosure/actions/index.react.tsx",
      "_lib/data/orders.ts",
    ]
  `);
});

test("disclosure actions flattens _lib data files", () => {
  expect(Object.keys(disclosureActions.files)).toMatchInlineSnapshot(`
    [
      "index.tsx",
      "orders.ts",
    ]
  `);
  // The #app alias import must be rewritten to the flattened sibling file.
  expect(disclosureActions.files["index.tsx"]?.content).toContain(
    'from "./orders.ts"',
  );
});

test("formats rewritten imports with the app Tailwind config", () => {
  expect(checkboxCardForm.files["index.tsx"]?.content).toContain(
    'className="ak-frame flex w-120 max-w-[100cqi] flex-col gap-6 ak-layer ak-frame-card/8 ak-layer-lighten-6 ak-dark:ak-frame-border ak-light:ring"',
  );
});

test("disclosure sources", () => {
  const sources = Object.values(disclosure.sources).map((source) => ({
    id: normalizeSourcePath(source.id),
    dependencies: Object.keys(source.dependencies ?? {}),
    devDependencies: Object.keys(source.devDependencies ?? {}),
  }));
  expect(sources).toMatchInlineSnapshot(`
    [
      {
        "dependencies": [
          "react",
          "react-dom",
          "@ariakit/ui",
        ],
        "devDependencies": [
          "@types/react",
          "@types/react-dom",
        ],
        "id": "disclosure/index.react.tsx",
      },
    ]
  `);
});
