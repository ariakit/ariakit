import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

// examples/select-form-disabled/test.ts
test("is disabled and omitted from form submission", async () => {
  const select = q.combobox("Favorite fruit");
  expect(select).toBeDisabled();
  expect(select).toHaveAttribute("aria-disabled", "true");
  await click(select);
  expect(q.listbox()).not.toBeInTheDocument();

  await click(q.button("Submit"));
  expect(q.status()).toHaveTextContent("Submitted: null");
});
