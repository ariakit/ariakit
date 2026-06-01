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
import { dirname, join } from "node:path";
import type { LoaderContext } from "astro/loaders";
import { afterEach, expect, test, vi } from "vitest";
import {
  discoverPreviews,
  getPreviewFrameworks,
  getPreviewFrameworksSync,
  PreviewDataSchema,
  previewLoader,
} from "./preview-discovery.ts";

const dirs: string[] = [];

afterEach(async () => {
  for (const dir of dirs.splice(0)) {
    await fs.rm(dir, { force: true, recursive: true });
  }
});

async function createDir() {
  const dir = await fs.mkdtemp(join(os.tmpdir(), "ariakit-preview-"));
  dirs.push(dir);
  return dir;
}

async function writeFile(file: string, content = "") {
  await fs.mkdir(dirname(file), { recursive: true });
  await fs.writeFile(file, content);
}

type WatchCallback = (file: string) => void | Promise<void>;

class TestWatcher {
  add = vi.fn();

  callbacks = new Map<string, WatchCallback[]>();

  on(event: string, callback: WatchCallback) {
    const callbacks = this.callbacks.get(event) ?? [];
    callbacks.push(callback);
    this.callbacks.set(event, callbacks);
    return this;
  }

  async emit(event: string, file: string) {
    const callbacks = this.callbacks.get(event) ?? [];
    for (const callback of callbacks) {
      await callback(file);
    }
  }
}

function getPreviewStoreContext(
  dir: string,
  loader: ReturnType<typeof previewLoader>,
) {
  const entries = new Map<string, { data: Record<string, unknown> }>();
  const watcher = new TestWatcher();
  const store = {
    clear: vi.fn(() => {
      entries.clear();
    }),
    addModuleImport: vi.fn(),
    set: vi.fn((entry: { id: string; data: Record<string, unknown> }) => {
      entries.set(entry.id, entry);
      return true;
    }),
  };
  const context = {
    collection: "previews",
    config: {
      root: new URL(`${dir}/`, "file:"),
      srcDir: new URL(`${dir}/`, "file:"),
    },
    generateDigest(value: Record<string, unknown> | string) {
      return JSON.stringify(value);
    },
    logger: {
      error: vi.fn(),
    },
    parseData: async <TData extends Record<string, unknown>>(options: {
      data: TData;
    }) => {
      const result = await loader.schema.safeParseAsync(options.data);
      if (!result.success) throw result.error;
      return result.data as unknown as TData;
    },
    store,
    watcher,
  } as unknown as LoaderContext;
  return { context, entries, store, watcher };
}

function getExamplesRoot(dir: string) {
  return {
    kind: "examples",
    dir: join(dir, "examples"),
    metadataRequired: true,
  };
}

function getSandboxRoot(dir: string) {
  return {
    kind: "sandbox",
    dir: join(dir, "sandbox"),
    metadataRequired: false,
  };
}

test("requires preview metadata for examples", async () => {
  const dir = await createDir();
  await writeFile(join(dir, "examples/menu/index.react.tsx"));

  const promise = discoverPreviews({
    roots: [getExamplesRoot(dir)],
  });

  await expect(promise).rejects.toThrow("Missing preview.json for menu");
});

test("infers frameworks from preview entry files", async () => {
  const dir = await createDir();
  await writeFile(join(dir, "examples/separator/index.solid.tsx"));
  await writeFile(join(dir, "examples/separator/index.react.tsx"));
  const previewDir = join(dir, "examples/separator");

  await expect(getPreviewFrameworks(previewDir)).resolves.toEqual([
    "react",
    "solid",
  ]);
  expect(getPreviewFrameworksSync(previewDir)).toEqual(["react", "solid"]);
});

test("returns empty frameworks without preview entry files", async () => {
  const dir = await createDir();
  await writeFile(join(dir, "examples/menu/index.ts"));
  const previewDir = join(dir, "examples/menu");

  await expect(getPreviewFrameworks(previewDir)).resolves.toEqual([]);
  expect(getPreviewFrameworksSync(previewDir)).toEqual([]);
});

test("rejects duplicate framework entry files", async () => {
  const dir = await createDir();
  await writeFile(join(dir, "examples/menu/index.react.tsx"));
  await writeFile(join(dir, "examples/menu/index.custom.react.tsx"));
  const previewDir = join(dir, "examples/menu");

  await expect(getPreviewFrameworks(previewDir)).rejects.toThrow(
    `Duplicate react preview in ${previewDir}`,
  );
  expect(() => getPreviewFrameworksSync(previewDir)).toThrow(
    `Duplicate react preview in ${previewDir}`,
  );
});

test("rejects framework metadata without matching entry files", async () => {
  const dir = await createDir();
  await writeFile(join(dir, "examples/menu/index.react.tsx"));
  await writeFile(
    join(dir, "examples/menu/preview.json"),
    JSON.stringify({ frameworks: ["react", "solid"], title: "Menu" }),
  );

  const promise = discoverPreviews({
    roots: [getExamplesRoot(dir)],
  });

  await expect(promise).rejects.toThrow(
    'Preview "menu" declares "solid" without an index.solid entry file',
  );
});

test("supports configured preview roots", async () => {
  const dir = await createDir();
  await writeFile(join(dir, "fixtures/menu/index.react.tsx"));
  await writeFile(
    join(dir, "fixtures/menu/preview.json"),
    JSON.stringify({ title: "Menu" }),
  );

  const previews = await discoverPreviews({
    roots: [
      {
        kind: "examples",
        dir: join(dir, "fixtures"),
        metadataRequired: true,
      },
    ],
  });

  expect(previews).toMatchObject([
    {
      frameworks: ["react"],
      id: "menu",
      source: "examples",
      title: "Menu",
    },
  ]);
});

test("requires title metadata for examples", async () => {
  const dir = await createDir();
  await writeFile(join(dir, "examples/menu/index.react.tsx"));
  await writeFile(join(dir, "examples/menu/preview.json"), "{}");

  const promise = discoverPreviews({
    roots: [getExamplesRoot(dir)],
  });

  await expect(promise).rejects.toThrow("Missing title metadata for menu");
});

test("requires title metadata for metadata-only examples", async () => {
  const dir = await createDir();
  await writeFile(
    join(dir, "examples/menu/preview.json"),
    JSON.stringify({ frameworks: ["react"] }),
  );

  const promise = discoverPreviews({
    roots: [getExamplesRoot(dir)],
  });

  await expect(promise).rejects.toThrow("Missing title metadata for menu");
});

test("rejects unknown preview metadata keys", async () => {
  const dir = await createDir();
  await writeFile(join(dir, "examples/menu/index.react.tsx"));
  await writeFile(
    join(dir, "examples/menu/preview.json"),
    JSON.stringify({ source: "sandbox", title: "Menu" }),
  );

  const promise = discoverPreviews({
    roots: [getExamplesRoot(dir)],
  });

  await expect(promise).rejects.toThrow(
    'Unknown preview metadata key "source" for menu',
  );
});

test("uses sandbox directory name without preview metadata", async () => {
  const dir = await createDir();
  await writeFile(join(dir, "sandbox/menu-4938/index.react.tsx"));

  const previews = await discoverPreviews({
    roots: [getSandboxRoot(dir)],
  });

  expect(previews).toMatchObject([
    {
      frameworks: ["react"],
      id: "menu-4938",
      source: "sandbox",
      title: "menu-4938",
    },
  ]);
});

test("supports sandbox title metadata", async () => {
  const dir = await createDir();
  await writeFile(join(dir, "sandbox/menu/index.react.tsx"));
  await writeFile(
    join(dir, "sandbox/menu/preview.json"),
    JSON.stringify({ title: "Menu" }),
  );

  const previews = await discoverPreviews({
    roots: [getSandboxRoot(dir)],
  });

  expect(previews).toMatchObject([
    {
      frameworks: ["react"],
      id: "menu",
      source: "sandbox",
      title: "Menu",
    },
  ]);
});

test("supports metadata-only sandbox previews", async () => {
  const dir = await createDir();
  await writeFile(
    join(dir, "sandbox/counter-nextjs/preview.json"),
    JSON.stringify({ frameworks: ["react"] }),
  );

  const previews = await discoverPreviews({
    roots: [getSandboxRoot(dir)],
  });

  expect(previews).toMatchObject([
    {
      entryFiles: {},
      frameworks: ["react"],
      id: "counter-nextjs",
      source: "sandbox",
      title: "counter-nextjs",
    },
  ]);
});

test("preview loader defines generated data schema", () => {
  const loader = previewLoader({
    roots: [getSandboxRoot("/tmp")],
  });

  expect("schema" in loader && loader.schema).toBe(PreviewDataSchema);
});

test("preview loader reloads watched metadata changes", async () => {
  const dir = await createDir();
  const loader = previewLoader({
    roots: [getExamplesRoot(dir)],
  });
  const { context, entries, watcher } = getPreviewStoreContext(dir, loader);
  const metadataFile = join(dir, "examples/menu/preview.json");
  await writeFile(join(dir, "examples/menu/index.react.tsx"));
  await writeFile(metadataFile, JSON.stringify({ title: "Menu" }));

  await loader.load(context);

  expect(entries.get("menu")?.data.title).toBe("Menu");
  await writeFile(metadataFile, JSON.stringify({ title: "Menu 2" }));
  await watcher.emit("change", metadataFile);

  expect(entries.get("menu")?.data.title).toBe("Menu 2");
});

test("preview loader reloads watched entry file changes", async () => {
  const dir = await createDir();
  const loader = previewLoader({
    roots: [getExamplesRoot(dir)],
  });
  const { context, entries, watcher } = getPreviewStoreContext(dir, loader);
  const metadataFile = join(dir, "examples/menu/preview.json");
  const reactEntryFile = join(dir, "examples/menu/index.react.tsx");
  const solidEntryFile = join(dir, "examples/menu/index.solid.tsx");
  await writeFile(reactEntryFile);
  await writeFile(metadataFile, JSON.stringify({ title: "Menu" }));

  await loader.load(context);

  expect(entries.get("menu")?.data.frameworks).toEqual(["react"]);
  await writeFile(solidEntryFile);
  await watcher.emit("add", solidEntryFile);

  expect(entries.get("menu")?.data.frameworks).toEqual(["react", "solid"]);
  await fs.rm(solidEntryFile);
  await watcher.emit("unlink", solidEntryFile);

  expect(entries.get("menu")?.data.frameworks).toEqual(["react"]);
  await fs.rm(reactEntryFile);
  await watcher.emit("unlink", reactEntryFile);

  expect(entries.has("menu")).toBe(false);
});
