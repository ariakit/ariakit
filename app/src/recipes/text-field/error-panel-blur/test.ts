import { blur, focus, q, type } from "@ariakit/test";
import { expect, test } from "vitest";

test("shows the error panel when focus leaves an invalid field", async () => {
  const field = q.textbox("Username");
  expect(q.alert()).toBeEmptyDOMElement();
  expect(field).not.toHaveAttribute("aria-invalid");
  expect(field).toHaveAccessibleDescription(
    "Use letters, numbers, and dashes.",
  );
  await focus(field);
  await blur(field);
  expect(q.alert()).toHaveTextContent("Remove the spaces.");
  expect(field).toHaveAttribute("aria-invalid", "true");
  expect(field).toHaveAccessibleDescription(
    "Remove the spaces. Use letters, numbers, and dashes.",
  );
});

test("clears the error panel once the value is valid", async () => {
  const field = q.textbox("Username");
  await focus(field);
  await blur(field);
  expect(q.alert()).toHaveTextContent("Remove the spaces.");
  // Replace the space and the last name with a dash and the last name.
  await type(`${"\b".repeat(9)}-lovelace`, field);
  expect(field).toHaveValue("ada-lovelace");
  expect(q.alert()).toBeEmptyDOMElement();
  expect(field).not.toHaveAttribute("aria-invalid");
  expect(field).toHaveAccessibleDescription(
    "Use letters, numbers, and dashes.",
  );
});
