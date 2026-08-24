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
const shortcutFilename = join(
  process.cwd(),
  "packages/ariakit-react/src/shortcut.ts",
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

test("loads Shortcut metadata", () => {
  for (const name of ["ShortcutProvider", "useShortcutStore"]) {
    const reference = getReference(shortcutFilename, name);
    expect(getProp(reference, "enabled").defaultValue).toBe("true");
    for (const prop of ["platform", "glyphs", "keyNames", "keys", "store"]) {
      getProp(reference, prop);
    }
  }

  const command = getReference(shortcutFilename, "ShortcutCommand");
  const commandEnabled = getProp(command, "enabled");
  expect(commandEnabled.description).toContain("aria-disabled");
  expect(commandEnabled.description).toContain("inert");

  const useCommand = getReference(shortcutFilename, "useShortcutCommand");
  for (const name of [
    "command",
    "keys",
    "onTrigger",
    "preventDefault",
    "scope",
    "enabled",
    "enabledInTextbox",
    "store",
  ]) {
    getProp(useCommand, name);
  }

  const useKeys = getReference(shortcutFilename, "useShortcutKeys");
  expect(useKeys.description).toContain("effective canonical alternatives");
  getProp(useKeys, "command");
  getProp(useKeys, "store");

  const input = getReference(shortcutFilename, "ShortcutInput");
  expect(getProp(input, "recording").defaultValue).toBe("false");
  expect(getProp(input, "cancelKeys").defaultValue).toBe('"Escape"');
  expect(getProp(input, "clearKeys").defaultValue).toBe('"Backspace Delete"');

  const referenceNames = getReferences(shortcutFilename).map(({ name }) => {
    return name;
  });
  expect(referenceNames).not.toContain("useShortcut");
  expect(referenceNames).not.toContain("useShortcutInput");
  expect(referenceNames).not.toContain("useShortcutScope");
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
