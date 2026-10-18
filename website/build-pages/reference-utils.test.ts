import { mkdtempDisposableSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test } from "vitest";
import { getReferences } from "./reference-utils.js";
import type { Reference } from "./types.ts";

const formFilename = join(process.cwd(), "packages/ariakit-react/src/form.ts");
const comboboxFilename = join(
  process.cwd(),
  "packages/ariakit-react/src/combobox.ts",
);
const compositeFilename = join(
  process.cwd(),
  "packages/ariakit-react/src/composite.ts",
);
const headingFilename = join(
  process.cwd(),
  "packages/ariakit-react/src/heading.ts",
);
const selectFilename = join(
  process.cwd(),
  "packages/ariakit-react/src/select.ts",
);

function getReference(filename: string, name: string) {
  const reference = getReferences(filename).find((reference) => {
    return reference.name === name;
  });
  if (!reference) {
    throw new Error(`Missing ${name} reference`);
  }
  return reference as Reference;
}

function getProp(reference: Reference, name: string) {
  const prop = reference.props.find((prop) => prop.name === name);
  if (!prop) {
    throw new Error(`Missing ${name} prop on ${reference.name}`);
  }
  return prop;
}

function getReturnProp(reference: Reference, name: string) {
  const prop = reference.returnProps?.find((prop) => prop.name === name);
  if (!prop) {
    throw new Error(`Missing ${name} return prop on ${reference.name}`);
  }
  return prop;
}

test("inherits descriptions and tags independently", () => {
  using dir = mkdtempDisposableSync(join(tmpdir(), "ariakit-reference-"));
  const filename = join(dir.path, "widget.ts");
  writeFileSync(
    filename,
    `
interface BaseOptions {
  /** Base description.
   * @default true
   * @deprecated Base deprecation.
   */
  value?: boolean;
}
interface DescriptionOptions extends BaseOptions {
  /** Local description. */
  value?: boolean;
}
interface WidgetOptions extends DescriptionOptions {
  value?: boolean;
}
interface TaggedOptions extends BaseOptions {
  /** @default false */
  value?: boolean;
}
export function Widget(_props: WidgetOptions) { return null; }
export function Tagged(_props: TaggedOptions) { return null; }
`,
  );
  const inherited = getProp(getReference(filename, "Widget"), "value");
  expect(inherited.description).toBe("Local description.");
  expect(inherited.defaultValue).toBe("true");
  expect(inherited.deprecated).toBe("Base deprecation.");
  const tagged = getProp(getReference(filename, "Tagged"), "value");
  expect(tagged.description).toBe("Base description.");
  expect(tagged.defaultValue).toBe("false");
  expect(tagged.deprecated).toBe(false);
});

test.each([
  ["form", "FormField", "FormControl"],
  ["menu", "MenuBar", "Menubar"],
  ["menu", "MenuBarProvider", "MenubarProvider"],
  ["menu", "useMenuBarStore", "useMenubarStore"],
  ["menu", "useMenuBarContext", "useMenubarContext"],
])("preserves the deprecation for %s/%s", (module, name, replacement) => {
  const filename = join(
    process.cwd(),
    `packages/ariakit-react/src/${module}.ts`,
  );
  const reference = getReference(filename, name);
  expect(reference.deprecated).toEqual(expect.stringContaining(replacement));
});

test("does not use non-props function parameters as reference props", () => {
  expect(getReference(formFilename, "useFormValue").props).toEqual([]);
  expect(getReference(formFilename, "useFormValidate").props).toEqual([]);
  expect(getReference(formFilename, "useFormSubmit").props).toEqual([]);
});

test("uses props parameters as reference props", () => {
  const props = getReference(formFilename, "useFormStore").props.map((prop) => {
    return prop.name;
  });

  expect(props).toContain("defaultValues");
});

test.each([
  ["toolbar", "Toolbar", "orientation", '"horizontal"'],
  ["toolbar", "Toolbar", "focusLoop", "true"],
  ["toolbar", "useToolbarStore", "orientation", '"horizontal"'],
  ["toolbar", "useToolbarStore", "focusLoop", "true"],
  ["combobox", "ComboboxPopover", "modal", "false"],
  ["combobox", "ComboboxPopover", "portal", "false"],
])("preserves inherited %s/%s %s metadata", (module, name, propName, value) => {
  const filename = join(
    process.cwd(),
    `packages/ariakit-react/src/${module}.ts`,
  );
  const prop = getProp(getReference(filename, name), propName);
  expect(prop.description).not.toBe("");
  expect(prop.defaultValue).toBe(value);
  expect(prop.optional).toBe(true);
});

test.each([
  ["composite", "CompositeItem"],
  ["menu", "MenuItem"],
  ["tab", "Tab"],
])("inherits the default below the local %s/%s description", (module, name) => {
  const filename = join(
    process.cwd(),
    `packages/ariakit-react/src/${module}.ts`,
  );
  const prop = getProp(getReference(filename, name), "shouldRegisterItem");
  expect(prop.description).toContain("won't be accessible via arrow keys");
  expect(prop.defaultValue).toBe("true");
  expect(prop.optional).toBe(true);
});

test.each([
  ["combobox", "ComboboxProvider", "focusLoop", "true"],
  ["combobox", "useComboboxStore", "focusWrap", "true"],
  ["combobox", "ComboboxProvider", "compositeElementInFocusOrder", "true"],
  ["combobox", "ComboboxItem", "focusOnHover", "false"],
  ["combobox", "ComboboxPopover", "autoFocusOnShow", "false"],
  ["menu", "MenuButton", "typeahead", "false"],
  [
    "composite",
    "CompositeSeparator",
    "orientation",
    'orientation === "horizontal" ? "vertical" : "horizontal"',
  ],
])("uses the local %s/%s %s default", (module, name, propName, value) => {
  const filename = join(
    process.cwd(),
    `packages/ariakit-react/src/${module}.ts`,
  );
  expect(getProp(getReference(filename, name), propName).defaultValue).toBe(
    value,
  );
});

test.each([
  ["menu", "Menu", "https://ariakit.com/examples/menubar-navigation"],
  ["tooltip", "Tooltip", "https://ariakit.com/examples/tooltip-framer-motion"],
])("preserves %s hideTimeout live examples", (module, component, example) => {
  const filename = join(
    process.cwd(),
    `packages/ariakit-react/src/${module}.ts`,
  );
  for (const name of [`${component}Provider`, `use${component}Store`]) {
    const prop = getProp(getReference(filename, name), "hideTimeout");
    expect(prop.description).toContain("Live examples:");
    expect(prop.description).toContain(example);
    expect(prop.defaultValue).toBe("0");
  }
});

test("uses typed destructured props parameters as reference props", () => {
  const comboboxProps = getReference(
    comboboxFilename,
    "ComboboxInputValue",
  ).props.map((prop) => {
    return prop.name;
  });
  const headingProps = getReference(headingFilename, "HeadingLevel").props.map(
    (prop) => {
      return prop.name;
    },
  );

  expect(comboboxProps).toContain("children");
  expect(headingProps).toContain("level");
});

test("loads Combobox Select prop metadata", () => {
  const provider = getReference(comboboxFilename, "ComboboxProvider");
  const defaultSelectedValue = getProp(provider, "defaultSelectedValue");
  expect(defaultSelectedValue.defaultValue).toBeNull();
  expect(defaultSelectedValue.description).toContain(
    "first enabled item with a defined value",
  );
  expect(defaultSelectedValue.description).toContain('Pass `""` explicitly');

  const popover = getReference(comboboxFilename, "ComboboxPopover");
  const typeahead = getProp(popover, "typeahead");
  expect(typeahead.defaultValue).toBeNull();
  expect(typeahead.description).toContain("Defaults to `false`");
  expect(typeahead.description).toContain("and `true` otherwise");

  const label = getReference(comboboxFilename, "ComboboxSelectLabel");
  expect(getProp(label, "store").description).toContain(
    "https://ariakit.com/reference/combobox-provider",
  );

  for (const name of ["ComboboxSelectArrow", "ComboboxSelectedValue"]) {
    const reference = getReference(comboboxFilename, name);
    const store = getProp(reference, "store");
    expect(store.description).toContain(
      "https://ariakit.com/reference/combobox-select",
    );
    expect(store.description).toContain(
      "https://ariakit.com/reference/combobox-provider",
    );
  }
});

test("loads Combobox input value metadata", () => {
  const provider = getReference(comboboxFilename, "ComboboxProvider");
  getProp(provider, "inputValue");
  getProp(provider, "defaultInputValue");
  getProp(provider, "setInputValue");

  const replacements = {
    value: "inputValue",
    defaultValue: "defaultInputValue",
    setValue: "setInputValue",
  };

  for (const [name, replacement] of Object.entries(replacements)) {
    const prop = getProp(provider, name);
    expect(prop.deprecated).toEqual(expect.stringContaining(replacement));
  }

  const inputValue = getReference(comboboxFilename, "ComboboxInputValue");
  getProp(inputValue, "children");

  const value = getReference(comboboxFilename, "ComboboxValue");
  getProp(value, "store");
  getProp(value, "children");
  expect(value.description).toContain("Renders the current");
  expect(value.deprecated).toEqual(
    expect.stringContaining("ComboboxInputValue"),
  );
});

test("loads Composite element alias metadata", () => {
  const provider = getReference(compositeFilename, "CompositeProvider");
  const includesBaseElement = getProp(provider, "includesBaseElement");
  expect(includesBaseElement.deprecated).toEqual(
    expect.stringContaining("compositeElementInFocusOrder"),
  );

  const store = getReference(compositeFilename, "useCompositeStore");
  for (const reference of [provider, store]) {
    const names = reference.props.map((prop) => prop.name);
    const compositeElementIndex = names.indexOf("compositeElementInFocusOrder");
    const includesBaseElementIndex = names.indexOf("includesBaseElement");
    expect(compositeElementIndex).toBeGreaterThanOrEqual(0);
    expect(includesBaseElementIndex).toBeGreaterThan(compositeElementIndex);
  }

  const setBaseElement = getReturnProp(store, "setBaseElement");
  expect(setBaseElement.deprecated).toEqual(
    expect.stringContaining("setCompositeElement"),
  );
});

test("loads Select deprecation metadata", () => {
  const replacements = {
    Select: "ComboboxSelect",
    SelectAnchor: "ComboboxAnchor",
    SelectArrow: "ComboboxSelectArrow",
    SelectDismiss: "ComboboxDismiss",
    SelectGroup: "ComboboxGroup",
    SelectGroupLabel: "ComboboxGroupLabel",
    SelectHeading: "ComboboxHeading",
    SelectItem: "ComboboxItem",
    SelectItemCheck: "ComboboxItemCheck",
    SelectItemSelected: "ComboboxItemSelected",
    SelectLabel: "ComboboxSelectLabel",
    SelectList: "ComboboxList",
    SelectPopover: "ComboboxPopover",
    SelectProvider: "ComboboxProvider",
    SelectRow: "ComboboxRow",
    SelectSeparator: "ComboboxGroup",
    SelectValue: "ComboboxSelectedValue",
    useSelectContext: "useComboboxContext",
    useSelectStore: "useComboboxStore",
  };

  for (const [name, replacement] of Object.entries(replacements)) {
    const reference = getReference(selectFilename, name);
    expect(reference.deprecated).toEqual(expect.stringContaining(replacement));
  }
});
