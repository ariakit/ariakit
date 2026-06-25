import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

// Reproduces https://github.com/ariakit/ariakit/issues/6305
test("failed submit focuses the first invalid field in document order", async () => {
  await click(q.button("Add company details"));

  const company = q.textbox.ensure("Company");
  const email = q.textbox.ensure("Email");

  await click(q.button("Sign up"));

  expect(company).toHaveAttribute("aria-invalid", "true");
  expect(email).toHaveAttribute("aria-invalid", "true");
  expect(company).toHaveFocus();
});
