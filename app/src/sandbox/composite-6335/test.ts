import { click, dispatch, q } from "@ariakit/test";
import { expect, test } from "vitest";

// Number inputs don't expose the text selection API that the type() utility
// relies on, so fire the input events the browser produces while the user
// edits the field.
async function setValue(input: HTMLElement, value: string) {
  const inputType = value ? "insertText" : "deleteContentBackward";
  await dispatch.input(input, { target: { value }, inputType });
}

// Reproduces https://github.com/ariakit/ariakit/issues/6335
test("clearing the page field does not crash the app", async () => {
  expect(q.option("Item 1")).toBeInTheDocument();
  const input = q.spinbutton.ensure("Page");
  await click(input);
  // Clearing the field makes the page number NaN, a transient state while the
  // user types another page number
  await setValue(input, "");
  expect(input).toHaveValue(null);
  expect(q.option("Item 1")).toBeInTheDocument();
  expect(q.listbox("Results")).toBeInTheDocument();
  // The app stays usable: typing a new page number renders that page
  await setValue(input, "2");
  expect(q.option("Item 6")).toBeInTheDocument();
});
