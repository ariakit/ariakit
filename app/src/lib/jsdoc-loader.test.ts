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
import { jsdoc } from "./jsdoc-loader.ts";
import type { Reference } from "./schemas.ts";

const dirs: string[] = [];

afterEach(async () => {
  for (const dir of dirs.splice(0)) {
    await fs.rm(dir, { force: true, recursive: true });
  }
});

async function createDir() {
  const dir = await fs.mkdtemp(join(os.tmpdir(), "ariakit-jsdoc-"));
  dirs.push(dir);
  return dir;
}

async function writeFile(file: string, content: string) {
  await fs.mkdir(dirname(file), { recursive: true });
  await fs.writeFile(file, content);
}

function getLoaderContext() {
  const entries = new Map<string, { id: string; data: Reference }>();
  const context = {
    logger: {
      error: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
    },
    meta: new Map<string, string>(),
    store: {
      delete: vi.fn((id: string) => entries.delete(id)),
      keys: () => entries.keys(),
      set: vi.fn((entry: { id: string; data: Reference }) => {
        entries.set(entry.id, entry);
        return true;
      }),
    },
  } as unknown as LoaderContext;
  return { context, entries };
}

async function createReferenceFixture() {
  const dir = await createDir();
  const packagePath = join(dir, "ariakit-react");
  const corePath = join(dir, "ariakit-react-components");

  await writeFile(
    join(packagePath, "src/index.ts"),
    `export * from "./widget";\n`,
  );
  await writeFile(
    join(packagePath, "src/widget.ts"),
    `export { Widget } from "@ariakit/react-components/widget/widget";\n`,
  );
  await writeFile(
    join(corePath, "src/widget/widget.tsx"),
    `
interface AncestorOptions {
  /**
   * Farthest override.
   *
   * Live examples:
   * - [Farthest](https://example.com/farthest)
   */
  overridden?: string;
  /**
   * Farthest fallback.
   *
   * Live examples:
   * - [Farthest](https://example.com/farthest-fallback)
   */
  fallback?: string;
  /**
   * Ancestor-only fallback.
   *
   * Live examples:
   * - [Farthest](https://example.com/farthest-only)
   */
  farthest?: string;
}

interface ParentOptions extends AncestorOptions {
  /**
   * Parent override.
   *
   * Live examples:
   * - [Parent](https://example.com/parent)
   */
  overridden?: string;
  /**
   * Parent fallback.
   *
   * Live examples:
   * - [Parent](https://example.com/parent-fallback)
   */
  fallback?: string;
  farthest?: string;
}

export interface WidgetOptions extends ParentOptions {
  /**
   * Local override.
   */
  overridden?: string;
  fallback?: string;
  farthest?: string;
}

/**
 * Widget description.
 */
export function Widget(_props: WidgetOptions) {
  return null;
}
`,
  );

  return { corePath, packagePath };
}

function getReference(
  entries: Map<string, { id: string; data: Reference }>,
  id: string,
) {
  const entry = entries.get(id);
  if (!entry) {
    throw new Error(`Missing reference entry: ${id}`);
  }
  return entry.data;
}

function getParamProp(reference: Reference, name: string) {
  const param = reference.params[0];
  if (!param?.props) {
    throw new Error(`Missing props for reference: ${reference.name}`);
  }
  const prop = param.props.find((prop) => prop.name === name);
  if (!prop) {
    throw new Error(`Missing prop: ${name}`);
  }
  return prop;
}

test("prefers the nearest prop description in base hierarchies", async () => {
  const { corePath, packagePath } = await createReferenceFixture();
  const { context, entries } = getLoaderContext();
  const loader = jsdoc({ corePath, framework: "react", packagePath });

  await loader.load(context);

  const reference = getReference(entries, "react/widget/widget");
  const overridden = getParamProp(reference, "overridden");
  const fallback = getParamProp(reference, "fallback");
  const farthest = getParamProp(reference, "farthest");

  expect(overridden.description).toBe("Local override.");
  expect(overridden.liveExamples).toEqual([]);
  expect(fallback.description).toBe("Parent fallback.");
  expect(fallback.liveExamples).toEqual([
    "https://example.com/parent-fallback",
  ]);
  expect(farthest.description).toBe("Ancestor-only fallback.");
  expect(farthest.liveExamples).toEqual(["https://example.com/farthest-only"]);
});
