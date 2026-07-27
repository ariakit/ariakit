import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

// examples/select-items-unmount/test.ts
test("restores registered items after the popover unmounts", async () => {
  const select = q.combobox("Favorite fruit");
  await click(select);
  await click(q.option("Banana"));
  expect(q.listbox()).not.toBeInTheDocument();

  await click(select);
  expect(q.option("Banana")).toHaveAttribute("aria-selected", "true");
  expect(q.option("Banana")).toHaveFocus();
});
