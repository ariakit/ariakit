import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

// Reproduces https://github.com/ariakit/ariakit/issues/7058
test("does not copy inherited aria attributes", async () => {
  await click(q.button("Inspect listbox"));

  expect(q.status("Listbox aria-hidden")).toHaveTextContent("not set");
});

// Reproduces https://github.com/ariakit/ariakit/issues/7058
test("does not copy an inherited role", async () => {
  await click(q.button("Inspect listbox"));

  expect(q.status("Listbox role")).toHaveTextContent("listbox");
});
