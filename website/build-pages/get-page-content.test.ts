import { expect, test } from "vitest";
import { createReferencePageContent } from "./get-page-content.js";
import type { Reference, ReferenceProp } from "./types.ts";

function createProp(name: string, deprecated: boolean): ReferenceProp {
  return {
    name,
    type: "unknown",
    description: `${name} description.`,
    optional: false,
    defaultValue: null,
    deprecated,
    examples: [],
  };
}

function getHeadingIndex(content: string, heading: string) {
  const index = content.indexOf(heading);
  expect(index).toBeGreaterThanOrEqual(0);
  return index;
}

test("sorts deprecated return props after active return props", () => {
  const reference: Reference = {
    filename: "form.ts",
    name: "useFormStore",
    description: "Creates a form store.",
    deprecated: false,
    examples: [],
    props: [],
    returnProps: [
      createProp("useValue", true),
      createProp("validate", false),
      createProp("useState", true),
      createProp("submit", false),
    ],
  };

  const content = createReferencePageContent(reference);
  const returnProps = content.slice(
    getHeadingIndex(content, "## Return Props"),
  );

  const submitIndex = getHeadingIndex(returnProps, "### `submit`");
  const validateIndex = getHeadingIndex(returnProps, "### `validate`");
  const useStateIndex = getHeadingIndex(returnProps, "### ~`useState`~");
  const useValueIndex = getHeadingIndex(returnProps, "### ~`useValue`~");

  expect(submitIndex).toBeLessThan(validateIndex);
  expect(validateIndex).toBeLessThan(useStateIndex);
  expect(useStateIndex).toBeLessThan(useValueIndex);
});
