import { click, hover, q } from "@ariakit/test";

test("hover on item", async () => {
  await click(q.combobox("Favorite food"));
  await hover(q.option("Banana"));
  expect(q.option("Banana")).toHaveFocus();
  await hover(q.text("Dairy"));
  expect(q.option("Banana")).not.toHaveFocus();
  expect(q.listbox()).toHaveFocus();
  expect(q.listbox()).not.toHaveAttribute("aria-activedescendant");
  await hover(q.option("Banana"));
  expect(q.option("Banana")).toHaveFocus();
});
