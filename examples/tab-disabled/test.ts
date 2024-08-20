import { press, q } from "@ariakit/test";

test("navigate through tabs with keyboard", async () => {
  await press.Tab();
  expect(q.tab("Vegetables")).toHaveFocus();
  expect(q.tab("Vegetables")).toHaveAttribute("aria-selected", "true");
  expect(q.tabpanel("Vegetables")).toBeVisible();

  await press.ArrowRight();
  expect(q.tab("Meat")).toHaveFocus();
  expect(q.tab("Meat")).toHaveAttribute("aria-selected", "false");
  expect(q.tabpanel.includesHidden("Meat")).not.toBeVisible();
  expect(q.tab("Vegetables")).toHaveAttribute("aria-selected", "true");
  expect(q.tabpanel("Vegetables")).toBeVisible();

  await press.ArrowRight();
  expect(q.tab("Fruits")).toHaveFocus();
  expect(q.tab("Fruits")).toHaveAttribute("aria-selected", "true");
  expect(q.tabpanel("Fruits")).toBeVisible();
});
