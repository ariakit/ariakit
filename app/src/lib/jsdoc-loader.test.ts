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

function getReturnProp(reference: Reference, name: string) {
  const prop = reference.returnValue?.props?.find((prop) => prop.name === name);
  if (!prop) {
    throw new Error(`Missing return prop: ${name}`);
  }
  return prop;
}

function getStateProp(reference: Reference, name: string) {
  const prop = reference.state.find((prop) => prop.name === name);
  if (!prop) {
    throw new Error(`Missing state prop: ${name}`);
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

test("loads component aliases as distinct references", async () => {
  const { context, entries } = getLoaderContext();
  const loader = jsdoc({
    corePath: join(process.cwd(), "packages/ariakit-react-components"),
    framework: "react",
    packagePath: join(process.cwd(), "packages/ariakit-react"),
  });

  await loader.load(context);

  const combobox = getReference(entries, "react/combobox/combobox");
  const comboboxInput = getReference(entries, "react/combobox/combobox-input");

  expect(combobox.description).toContain(
    "**Alias**: [`ComboboxInput`](https://ariakit.com/reference/combobox-input)",
  );
  expect(comboboxInput.description).toContain(
    "**Alias**: [`Combobox`](https://ariakit.com/reference/combobox)",
  );
  expect(comboboxInput.params[0]?.props).toEqual(combobox.params[0]?.props);
});

test("loads Combobox Select prop metadata", async () => {
  const { context, entries } = getLoaderContext();
  const loader = jsdoc({
    corePath: join(process.cwd(), "packages/ariakit-react-components"),
    framework: "react",
    packagePath: join(process.cwd(), "packages/ariakit-react"),
  });

  await loader.load(context);

  const provider = getReference(entries, "react/combobox/combobox-provider");
  const defaultSelectedValue = getParamProp(provider, "defaultSelectedValue");
  expect(defaultSelectedValue.defaultValue).toBeUndefined();
  expect(defaultSelectedValue.description).toContain(
    "first enabled item with a defined value",
  );
  expect(defaultSelectedValue.description).toContain('Pass `""` explicitly');

  const popover = getReference(entries, "react/combobox/combobox-popover");
  const typeahead = getParamProp(popover, "typeahead");
  expect(typeahead.defaultValue).toBeUndefined();
  expect(typeahead.description).toContain("Defaults to `false`");
  expect(typeahead.description).toContain("and `true` otherwise");

  const label = getReference(entries, "react/combobox/combobox-select-label");
  const labelStore = getParamProp(label, "store");
  expect(labelStore.description).toContain(
    "https://ariakit.com/reference/combobox-provider",
  );

  for (const id of [
    "react/combobox/combobox-select-arrow",
    "react/combobox/combobox-selected-value",
  ]) {
    const reference = getReference(entries, id);
    const store = getParamProp(reference, "store");
    expect(store.description).toContain(
      "https://ariakit.com/reference/combobox-select",
    );
    expect(store.description).toContain(
      "https://ariakit.com/reference/combobox-provider",
    );
  }
});

test("loads Combobox input value metadata", async () => {
  const { context, entries } = getLoaderContext();
  const loader = jsdoc({
    corePath: join(process.cwd(), "packages/ariakit-react-components"),
    framework: "react",
    packagePath: join(process.cwd(), "packages/ariakit-react"),
  });

  await loader.load(context);

  const provider = getReference(entries, "react/combobox/combobox-provider");
  getParamProp(provider, "inputValue");
  getParamProp(provider, "defaultInputValue");
  getParamProp(provider, "setInputValue");

  const replacements = {
    value: "inputValue",
    defaultValue: "defaultInputValue",
    setValue: "setInputValue",
  };

  for (const [name, replacement] of Object.entries(replacements)) {
    const prop = getParamProp(provider, name);
    expect(prop.deprecated).toEqual(expect.stringContaining(replacement));
  }

  const inputValue = getReference(
    entries,
    "react/combobox/combobox-input-value",
  );
  getParamProp(inputValue, "children");

  const value = getReference(entries, "react/combobox/combobox-value");
  getParamProp(value, "store");
  getParamProp(value, "children");
  expect(value.description).toContain("Renders the current");
  expect(value.deprecated).toEqual(
    expect.stringContaining("ComboboxInputValue"),
  );
});

test("loads Composite element alias metadata", async () => {
  const { context, entries } = getLoaderContext();
  const loader = jsdoc({
    corePath: join(process.cwd(), "packages/ariakit-react-components"),
    framework: "react",
    packagePath: join(process.cwd(), "packages/ariakit-react"),
  });

  await loader.load(context);

  const provider = getReference(entries, "react/composite/composite-provider");
  const includesBaseElement = getParamProp(provider, "includesBaseElement");
  expect(includesBaseElement.deprecated).toEqual(
    expect.stringContaining("compositeElementInFocusOrder"),
  );

  const store = getReference(entries, "react/composite/use-composite-store");
  const stateReplacements = {
    baseElement: "compositeElement",
    includesBaseElement: "compositeElementInFocusOrder",
  };

  for (const [name, replacement] of Object.entries(stateReplacements)) {
    const prop = getStateProp(store, name);
    expect(prop.deprecated).toEqual(expect.stringContaining(replacement));
  }

  const setBaseElement = getReturnProp(store, "setBaseElement");
  expect(setBaseElement.deprecated).toEqual(
    expect.stringContaining("setCompositeElement"),
  );
});

test("loads Composite selection metadata without publishing selectable references", async () => {
  const { context, entries } = getLoaderContext();
  const loader = jsdoc({
    corePath: join(process.cwd(), "packages/ariakit-react-components"),
    framework: "react",
    packagePath: join(process.cwd(), "packages/ariakit-react"),
  });

  await loader.load(context);

  const item = getReference(entries, "react/composite/composite-item");
  const id = getParamProp(item, "id");
  expect.soft(id.description.toLowerCase()).toContain("stable");
  expect.soft(id.description.toLowerCase()).toContain("remount");

  const store = getReference(entries, "react/composite/use-composite-store");
  const move = getReturnProp(store, "move");
  expect.soft(move.type).toContain("options?:");
  expect.soft(move.type).toContain("extend?: boolean");
  expect.soft(move.type).toContain("anchor?: boolean");
  expect.soft(move.description).toMatch(/no(?: effect|-op)/i);
  expect.soft(move.description.toLowerCase()).toContain("plain composite");

  const comboboxStore = getReference(
    entries,
    "react/combobox/use-combobox-store",
  );
  const comboboxStoreFunctions =
    comboboxStore.returnValue?.props?.map((prop) => prop.name) ?? [];
  expect.soft(comboboxStoreFunctions).not.toContain("selection");
  expect.soft(comboboxStoreFunctions).not.toContain("unstable_selection");

  const selectStore = getReference(entries, "react/select/use-select-store");
  const selectStoreFunctions =
    selectStore.returnValue?.props?.map((prop) => prop.name) ?? [];
  expect.soft(selectStoreFunctions).not.toContain("selection");
  expect.soft(selectStoreFunctions).not.toContain("unstable_selection");

  const selectableReferenceIds = [...entries.keys()].filter((id) => {
    return id.includes("composite-selectable");
  });
  expect.soft(selectableReferenceIds).toEqual([]);
});

test("loads Select deprecation metadata", async () => {
  const { context, entries } = getLoaderContext();
  const loader = jsdoc({
    corePath: join(process.cwd(), "packages/ariakit-react-components"),
    framework: "react",
    packagePath: join(process.cwd(), "packages/ariakit-react"),
  });

  await loader.load(context);

  const replacements = {
    select: "ComboboxSelect",
    "select-anchor": "ComboboxAnchor",
    "select-arrow": "ComboboxSelectArrow",
    "select-dismiss": "ComboboxDismiss",
    "select-group": "ComboboxGroup",
    "select-group-label": "ComboboxGroupLabel",
    "select-heading": "ComboboxHeading",
    "select-item": "ComboboxItem",
    "select-item-check": "ComboboxItemCheck",
    "select-item-selected": "ComboboxItemSelected",
    "select-label": "ComboboxSelectLabel",
    "select-list": "ComboboxList",
    "select-popover": "ComboboxPopover",
    "select-provider": "ComboboxProvider",
    "select-row": "ComboboxRow",
    "select-separator": "ComboboxGroup",
    "select-value": "ComboboxSelectedValue",
    "use-select-context": "useComboboxContext",
    "use-select-store": "useComboboxStore",
  };

  for (const [slug, replacement] of Object.entries(replacements)) {
    const reference = getReference(entries, `react/select/${slug}`);
    expect(reference.deprecated).toEqual(expect.stringContaining(replacement));
  }
});
