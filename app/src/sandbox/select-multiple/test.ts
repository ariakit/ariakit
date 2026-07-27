import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

// examples/select-multiple/test.ts
test("keeps the list open while toggling multiple values", async () => {
  const select = q.combobox("Favorite food");
  expect(select).toHaveTextContent("2 food selected");

  await click(select);
  await click(q.option("Chocolate"));
  expect(q.option("Chocolate")).toHaveAttribute("aria-selected", "true");
  expect(q.listbox()).toBeVisible();
  expect(select).toHaveTextContent("3 food selected");

  await click(q.option("Chocolate"));
  expect(q.option("Chocolate")).toHaveAttribute("aria-selected", "false");
  expect(select).toHaveTextContent("2 food selected");
});
