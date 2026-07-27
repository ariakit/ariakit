import { click, hover, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

// examples/select-group/test.ts
test("clears the active option when hovering a group label", async () => {
  const select = q.combobox("Favorite food");
  await click(select);
  await hover(q.option("Banana"));
  expect(q.option("Banana")).toHaveFocus();

  await hover(q.text("Dairy"));
  expect(q.option("Banana")).not.toHaveFocus();
  expect(select).not.toHaveAttribute("aria-activedescendant");
  await press.ArrowDown();
  expect(q.option("Apple")).toHaveFocus();
});
