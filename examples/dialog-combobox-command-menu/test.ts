import { click, hover, press, q, type, waitFor } from "@ariakit/test";

async function hoverOutside() {
  await hover(document.body);
  await hover(document.body, { clientX: 10, clientY: 10 });
}

test("open dialog with click and hide with esc", async () => {
  expect(q.dialog("Command Menu")).not.toBeInTheDocument();
  await click(q.button("Open Command Menu"));
  expect(q.dialog("Command Menu")).toBeVisible();
  expect(q.combobox("Search for apps and commands...")).toHaveFocus();
  expect(q.option("Search Contacts")).toHaveFocus();
  expect(q.group("Suggestions")).toBeVisible();
  await press.Escape();
  expect(q.option("Search Contacts")).toHaveAttribute("data-active-item");
  await waitFor(() => expect(q.dialog()).not.toBeInTheDocument());
  expect(q.button("Open Command Menu")).toHaveFocus();
});

test("open dialog with click and hide by clicking outside", async () => {
  await click(q.button("Open Command Menu"));
  expect(q.dialog("Command Menu")).toBeVisible();
  expect(q.combobox("Search for apps and commands...")).toHaveFocus();
  await click(document.body);
  expect(q.option("Search Contacts")).toHaveAttribute("data-active-item");
  await waitFor(() => expect(q.dialog()).not.toBeInTheDocument());
  expect(q.button("Open Command Menu")).toHaveFocus();
});

test("open dialog with enter and hide by pressing enter on esc button", async () => {
  await press.Tab();
  await press.Enter();
  expect(q.dialog("Command Menu")).toBeVisible();
  expect(q.combobox("Search for apps and commands...")).toHaveFocus();
  await press.Tab();
  expect(q.button("Esc")).toHaveFocus();
  await press.Enter();
  await waitFor(() => expect(q.dialog()).not.toBeInTheDocument());
});

test("navigate through items with keyboard", async () => {
  await click(q.button("Open Command Menu"));
  expect(q.option("Search Contacts")).toHaveFocus();
  await press.ArrowDown();
  expect(q.option("Improve Writing")).toHaveFocus();
  await press.ArrowUp();
  await press.ArrowUp();
  await press.ArrowUp();
  expect(q.option("Search Contacts")).toHaveFocus();
  expect(q.combobox()).toHaveFocus();
});

test("navigate though items with mouse", async () => {
  await click(q.button("Open Command Menu"));
  expect(q.option("Search Contacts")).toHaveFocus();
  await hover(q.option("My Schedule"));
  expect(q.option("My Schedule")).toHaveFocus();
  expect(q.combobox()).toHaveFocus();
  await hoverOutside();
  expect(q.option("My Schedule")).toHaveFocus();
  await click(q.combobox());
  expect(q.option("My Schedule")).toHaveFocus();
});

test("search", async () => {
  await click(q.button("Open Command Menu"));
  await type("se");
  expect(q.group("Results")).toBeVisible();
  expect(q.option("Search AI Commands")).toHaveFocus();
  await type("l");
  expect(q.option.all()).toHaveLength(2);
  expect(q.option("Fix Spelling and Grammar")).toHaveFocus();
  await type("ec");
  expect(q.option.all()).toHaveLength(0);
  expect(q.text("No results found")).toBeVisible();
  await type("\b\b\b\b\b");
  expect(q.option("Search Contacts")).toHaveFocus();
});
