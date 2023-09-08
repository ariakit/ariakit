import { click, getByRole, press, queryByRole, type } from "@ariakit/test";

const getButton = (name: string) => getByRole("button", { name });
const getSelect = (name: string) => queryByRole("combobox", { name });
const getListbox = (name: string) => queryByRole("listbox", { name });
const getOption = (name: string) => getByRole("option", { name });
const getMenu = () => queryByRole("menu");
const getMenuItem = (name: string) => getByRole("menuitem", { name });

test("no filters", () => {
  expect(getButton("Filters (0)")).toBeVisible();
});

test("add filter with mouse then click outside", async () => {
  await click(getButton("Filters (0)"));
  expect(getSelect("Language:")).not.toBeInTheDocument();
  expect(getListbox("Language:")).not.toBeInTheDocument();
  await click(getMenuItem("Language"));
  expect(getMenu()).not.toBeInTheDocument();
  expect(getButton("Filters (1)")).toBeVisible();
  expect(getSelect("Language:")).toBeVisible();
  expect(getSelect("Language:")).toHaveAttribute("aria-expanded", "true");
  expect(getListbox("Language:")).toBeInTheDocument();
  expect(getListbox("Language:")).toHaveFocus();
  expect(getSelect("Language:")).toHaveTextContent("Language: Choose one");
  await click(document.body);
  expect(getButton("Filters (0)")).toBeVisible();
  expect(getSelect("Language:")).not.toBeInTheDocument();
  expect(getListbox("Language:")).not.toBeInTheDocument();
});

test("add filter with keyboard then press tab", async () => {
  await press.Tab();
  expect(getButton("Filters (0)")).toHaveFocus();
  await press.ArrowDown();
  await press.Space();
  expect(getMenu()).not.toBeInTheDocument();
  expect(getButton("Filters (1)")).toBeVisible();
  expect(getSelect("Status:")).toBeVisible();
  expect(getSelect("Status:")).toHaveAttribute("aria-expanded", "true");
  expect(getListbox("Status:")).toBeInTheDocument();
  expect(getListbox("Status:")).toHaveFocus();
  expect(getSelect("Status:")).toHaveTextContent("Status: Choose one");
  await press.Tab();
  expect(getButton("Filters (0)")).toBeVisible();
  expect(getSelect("Status:")).not.toBeInTheDocument();
  expect(getListbox("Status:")).not.toBeInTheDocument();
});

test("add filter with mouse and select an option", async () => {
  await click(getButton("Filters (0)"));
  await click(getMenuItem("Language"));
  await click(getOption("French"));
  expect(getButton("Filters (1)")).toBeVisible();
  expect(getListbox("Language:")).not.toBeInTheDocument();
  expect(getSelect("Language:")).toBeVisible();
  expect(getSelect("Language:")).toHaveFocus();
  expect(getSelect("Language:")).toHaveAttribute("aria-expanded", "false");
  expect(getSelect("Language:")).toHaveTextContent("Language: French");
});

test("add more filters", async () => {
  await click(getButton("Filters (0)"));
  await click(getMenuItem("Language"));
  await click(getOption("French"));
  await press.Tab();
  await press.Tab();
  expect(getButton("Filters (1)")).toHaveFocus();
  await press.ArrowUp();
  await press.ArrowUp();
  await press.Space();
  expect(getButton("Filters (2)")).toBeVisible();
  expect(getSelect("Author:")).toBeVisible();
  expect(getListbox("Author:")).toBeInTheDocument();
  expect(getListbox("Author:")).toHaveFocus();
  expect(getSelect("Author:")).toHaveTextContent("Author: Choose one");
  await type("ja");
  expect(getOption("Jane Doe")).toHaveFocus();
  await press.Enter();
  expect(getSelect("Author:")).toHaveFocus();
  expect(getSelect("Author:")).toHaveTextContent("Author: Jane Doe");
  await type("j");
  expect(getSelect("Author:")).toHaveTextContent("Author: John Doe");
});

test("remove filters", async () => {
  await press.Tab();
  expect(getButton("Filters (0)")).toHaveFocus();
  await press.Enter();
  await press.Enter();
  expect(getButton("Filters (1)")).toBeVisible();
  await press.ArrowDown();
  await press.Enter();
  expect(getSelect("Status:")).toHaveFocus();
  expect(getSelect("Status:")).toHaveTextContent("Status: Draft");
  await press.Tab();
  await press.Tab();
  await press.ArrowDown();
  await press.ArrowDown();
  await press.Space();
  expect(getButton("Filters (2)")).toBeVisible();
  await press.ArrowUp();
  await press.Space();
  expect(getSelect("Language:")).toHaveFocus();
  expect(getSelect("Language:")).toHaveTextContent("Language: German");
  await press.Tab();
  expect(getButton("Remove Language filter")).toHaveFocus();
  await press.Enter();
  expect(getSelect("Language:")).not.toBeInTheDocument();
  await click(getButton("Filters (1)"));
  await click(getMenuItem("Clear all"));
  expect(getMenu()).not.toBeInTheDocument();
  expect(getButton("Filters (0)")).toHaveFocus();
});
