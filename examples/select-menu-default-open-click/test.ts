import { click, press, q, type } from "@ariakit/test";

test("no filters", () => {
  expect(q.button("Filters (0)")).toBeVisible();
});

test("add filter with mouse then click outside", async () => {
  await click(q.button("Filters (0)"));
  expect(q.combobox("Language:")).not.toBeInTheDocument();
  expect(q.listbox("Language:")).not.toBeInTheDocument();
  await click(q.menuitem("Language"));
  expect(q.menu()).not.toBeInTheDocument();
  expect(q.button("Filters (1)")).toBeVisible();
  expect(q.combobox("Language:")).toBeVisible();
  expect(q.combobox("Language:")).toHaveAttribute("aria-expanded", "true");
  expect(q.listbox("Language:")).toBeInTheDocument();
  expect(q.listbox("Language:")).toHaveFocus();
  expect(q.combobox("Language:")).toHaveTextContent("Language: Choose one");
  await click(document.body);
  expect(q.button("Filters (0)")).toBeVisible();
  expect(q.combobox("Language:")).not.toBeInTheDocument();
  expect(q.listbox("Language:")).not.toBeInTheDocument();
});

test("add filter with keyboard then press tab", async () => {
  await press.Tab();
  expect(q.button("Filters (0)")).toHaveFocus();
  await press.ArrowDown();
  await press.Space();
  expect(q.menu()).not.toBeInTheDocument();
  expect(q.button("Filters (1)")).toBeVisible();
  expect(q.combobox("Status:")).toBeVisible();
  expect(q.combobox("Status:")).toHaveAttribute("aria-expanded", "true");
  expect(q.listbox("Status:")).toBeInTheDocument();
  expect(q.listbox("Status:")).toHaveFocus();
  expect(q.combobox("Status:")).toHaveTextContent("Status: Choose one");
  await press.Tab();
  expect(q.button("Filters (0)")).toBeVisible();
  expect(q.combobox("Status:")).not.toBeInTheDocument();
  expect(q.listbox("Status:")).not.toBeInTheDocument();
});

test("add filter with mouse and select an option", async () => {
  await click(q.button("Filters (0)"));
  await click(q.menuitem("Language"));
  await click(q.option("French"));
  expect(q.button("Filters (1)")).toBeVisible();
  expect(q.listbox("Language:")).not.toBeInTheDocument();
  expect(q.combobox("Language:")).toBeVisible();
  expect(q.combobox("Language:")).toHaveFocus();
  expect(q.combobox("Language:")).toHaveAttribute("aria-expanded", "false");
  expect(q.combobox("Language:")).toHaveTextContent("Language: French");
});

test("add more filters", async () => {
  await click(q.button("Filters (0)"));
  await click(q.menuitem("Language"));
  await click(q.option("French"));
  await press.Tab();
  await press.Tab();
  expect(q.button("Filters (1)")).toHaveFocus();
  await press.ArrowUp();
  await press.ArrowUp();
  await press.Space();
  expect(q.button("Filters (2)")).toBeVisible();
  expect(q.combobox("Author:")).toBeVisible();
  expect(q.listbox("Author:")).toBeInTheDocument();
  expect(q.listbox("Author:")).toHaveFocus();
  expect(q.combobox("Author:")).toHaveTextContent("Author: Choose one");
  await type("ja");
  expect(q.option("Jane Doe")).toHaveFocus();
  await press.Enter();
  expect(q.combobox("Author:")).toHaveFocus();
  expect(q.combobox("Author:")).toHaveTextContent("Author: Jane Doe");
  await type("j");
  expect(q.combobox("Author:")).toHaveTextContent("Author: John Doe");
});

test("remove filters", async () => {
  await press.Tab();
  expect(q.button("Filters (0)")).toHaveFocus();
  await press.Enter();
  await press.Enter();
  expect(q.button("Filters (1)")).toBeVisible();
  await press.ArrowDown();
  await press.Enter();
  expect(q.combobox("Status:")).toHaveFocus();
  expect(q.combobox("Status:")).toHaveTextContent("Status: Draft");
  await press.Tab();
  await press.Tab();
  await press.ArrowDown();
  await press.ArrowDown();
  await press.Space();
  expect(q.button("Filters (2)")).toBeVisible();
  await press.ArrowUp();
  await press.Space();
  expect(q.combobox("Language:")).toHaveFocus();
  expect(q.combobox("Language:")).toHaveTextContent("Language: German");
  await press.Tab();
  expect(q.button("Remove Language filter")).toHaveFocus();
  await press.Enter();
  expect(q.combobox("Language:")).not.toBeInTheDocument();
  await click(q.button("Filters (1)"));
  await click(q.menuitem("Clear all"));
  expect(q.menu()).not.toBeInTheDocument();
  expect(q.button("Filters (0)")).toHaveFocus();
});
