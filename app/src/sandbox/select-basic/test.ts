import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

// examples/select/test.ts
test("opens on the selected item and commits another option", async () => {
  const select = q.combobox("Favorite fruit");
  expect(select).toHaveTextContent("Apple");

  await click(select);
  expect(q.option("Apple")).toHaveFocus();
  expect(q.option("Apple")).toHaveAttribute("aria-selected", "true");

  await click(q.option("Banana"));
  expect(q.listbox()).not.toBeInTheDocument();
  expect(select).toHaveTextContent("Banana");
});
