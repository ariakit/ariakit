import { click, press, q, type } from "@ariakit/test";

test("popover is not shown on click when combobox is pristine", async () => {
  expect(q.listbox()).not.toBeInTheDocument();
  await click(q.combobox());
  expect(q.listbox()).not.toBeInTheDocument();
});

test("popover is not shown on arrow down key when combobox is pristine", async () => {
  await press.Tab();
  expect(q.listbox()).not.toBeInTheDocument();
  await press.ArrowDown();
  expect(q.listbox()).not.toBeInTheDocument();
});

test("show popover after typing", async () => {
  await press.Tab();
  await type("a");
  expect(q.listbox()).toBeVisible();
});

test("popover is shown on click when combobox is dirty", async () => {
  await press.Tab();
  await type("a");
  await press.Escape();
  expect(q.listbox()).not.toBeInTheDocument();
  await click(q.combobox());
  expect(q.listbox()).toBeVisible();
  expect(q.option(/Apple/)).not.toHaveFocus();
});

test("popover is shown on arrow down key when combobox is dirty", async () => {
  await press.Tab();
  await type("a");
  await press.Escape();
  expect(q.listbox()).not.toBeInTheDocument();
  await press.ArrowDown();
  expect(q.listbox()).toBeVisible();
  expect(q.option(/Apple/)).not.toHaveFocus();
});
