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

test("uses the props type for branded provider const exports", () => {
  // Provider components are exported as `const X = createXProvider(function
  // X() {})` and expose a `XProviderProps` type instead of `XProviderOptions`.
  // Their props must still be resolved from that type.
  const props = getReference(comboboxFilename, "ComboboxProvider").props.map(
    (prop) => {
      return prop.name;
    },
  );

  expect(props).toContain("virtualFocus");
});
