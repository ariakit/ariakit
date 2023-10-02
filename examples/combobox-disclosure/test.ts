import { click, q, type } from "@ariakit/test";

test("show and hide popup with disclosure button", async () => {
  await click(q.button("Show popup"));
  expect(q.listbox()).toBeVisible();
  await click(q.button("Hide popup"));
  expect(q.listbox()).not.toBeInTheDocument();
});

test("keep focus on combobox if disclosure button pressed", async () => {
  await click(q.button("Show popup"));
  await type("abc");
  expect(q.combobox()).toHaveFocus();
  await click(q.button("Hide popup"));
  expect(q.combobox()).toHaveFocus();
});
