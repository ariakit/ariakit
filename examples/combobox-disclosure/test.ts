import { click, press, q, type } from "@ariakit/test";

test("show and hide popup with disclosure button", async () => {
  expect(q.button("Show popup")).toHaveAttribute("aria-expanded", "false");
  await click(q.button("Show popup"));
  expect(q.button("Hide popup")).toHaveAttribute("aria-expanded", "true");
  expect(q.listbox()).toBeVisible();
  await click(q.button("Hide popup"));
  expect(q.button("Show popup")).toHaveAttribute("aria-expanded", "false");
  expect(q.listbox()).not.toBeInTheDocument();
});

test("show and hide popup with combobox", async () => {
  expect(q.button("Show popup")).toHaveAttribute("aria-expanded", "false");
  await click(q.combobox());
  expect(q.button("Hide popup")).toHaveAttribute("aria-expanded", "true");
  expect(q.listbox()).toBeVisible();
  await press.Escape();
  expect(q.button("Show popup")).toHaveAttribute("aria-expanded", "false");
  expect(q.listbox()).not.toBeInTheDocument();
});

test("keep focus on combobox if disclosure button pressed", async () => {
  await click(q.button("Show popup"));
  await type("abc");
  expect(q.combobox()).toHaveFocus();
  await click(q.button("Hide popup"));
  expect(q.combobox()).toHaveFocus();
});
