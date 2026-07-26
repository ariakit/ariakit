import { join } from "node:path";
import { expect, test } from "vitest";
import { getReferences } from "./reference-utils.js";
import type { Reference } from "./types.ts";

const formFilename = join(process.cwd(), "packages/ariakit-react/src/form.ts");
const comboboxFilename = join(
  process.cwd(),
  "packages/ariakit-react/src/combobox.ts",
);
const headingFilename = join(
  process.cwd(),
  "packages/ariakit-react/src/heading.ts",
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
    "ComboboxValue",
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
