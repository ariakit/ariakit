/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test } from "vitest";
import separator from "#app/examples/separator/_component/index.react.tsx?source";
import type { Source } from "./source.ts";
import { sourcePlugin } from "./source.ts";

const APP_SRC_DIR = join(import.meta.dirname, "../");
const EXAMPLES_DIR = join(APP_SRC_DIR, "examples/");

async function loadSourceFile(file: string, aliasRoot = APP_SRC_DIR) {
  const plugin = sourcePlugin();
  if (typeof plugin.load !== "function") {
    throw new TypeError("Expected source plugin load hook");
  }
  const context = {
    addWatchFile() {},
    // Resolve the fixture's #app alias without requiring a Vite server.
    resolve(id: string) {
      if (!id.startsWith("#app/")) {
        throw new Error(`Unexpected import in the fixture: ${id}`);
      }
      return { id: join(aliasRoot, id.slice("#app/".length)) };
    },
  };
  const code = await Reflect.apply(plugin.load, context, [`${file}?source`]);
  if (typeof code !== "string") {
    throw new TypeError("Expected source plugin output");
  }
  const source: Source = JSON.parse(code.replace(/^export default /, ""));
  return source;
}

test("collects separator source and dependencies", async () => {
  const entry = join(EXAMPLES_DIR, "separator/_component/index.react.tsx");

  expect(separator.name).toBe("separator/_component");
  expect(Object.keys(separator.dependencies)).toEqual([
    "react",
    "react-dom",
    "@ariakit/react",
  ]);
  expect(Object.keys(separator.devDependencies)).toEqual([
    "@types/react",
    "@types/react-dom",
  ]);
  expect(Object.keys(separator.files)).toEqual(["index.tsx"]);
  expect(Object.keys(separator.sources)).toEqual([entry]);
  expect(separator.sources[entry]).toEqual({
    id: entry,
    content: await readFile(entry, "utf-8"),
    dependencies: separator.dependencies,
    devDependencies: separator.devDependencies,
  });
});

test("cached flattened files use the current source base directory", async () => {
  const root = await mkdtemp(join(tmpdir(), "ariakit-source-collection-"));
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

test("flattens shared alias imports without changing class order", async () => {
  const root = await mkdtemp(join(tmpdir(), "ariakit-source-collection-"));
  const exampleDir = join(root, "example");
  // A filename without a framework suffix needs no packages in the temp dir.
  const entry = join(exampleDir, "index.tsx");
  const shared = join(root, "data.ts");
  const classes = "w-120 max-w-[100cqi] flex flex-col gap-6";
  const entryContent = [
    'import { data } from "#app/data.ts";',
    `export default function Example() { return <div className="${classes}">{data}</div>; }`,
  ].join("\n");
  const sharedContent = 'export const data = "Shared data";\n';

  try {
    await mkdir(exampleDir);
    await writeFile(entry, entryContent);
    await writeFile(shared, sharedContent);

    const source = await loadSourceFile(entry, root);

    expect(Object.keys(source.sources)).toEqual([entry, shared]);
    expect(source.sources[entry]?.content).toBe(entryContent);
    expect(source.sources[shared]?.content).toBe(sharedContent);
    expect(Object.keys(source.files)).toEqual(["index.tsx", "data.ts"]);
    // Rewriting the alias also formats the file with Prettier.
    expect(source.files["index.tsx"]?.content).toBe(
      'import { data } from "./data.ts";\n' +
        "export default function Example() {\n" +
        `  return <div className="${classes}">{data}</div>;\n` +
        "}\n",
    );
    expect(source.files["data.ts"]?.content).toBe(sharedContent);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
