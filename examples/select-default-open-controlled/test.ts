import { click, q } from "@ariakit/test";

test("popover can be toggled", async () => {
  expect(q.listbox()).toBeVisible();
  await click(q.combobox());
  expect(q.listbox()).not.toBeInTheDocument();
  await click(q.combobox());
  expect(q.listbox()).toBeVisible();
});
