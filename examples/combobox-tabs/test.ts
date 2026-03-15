import { click, hover, press, q, type } from "@ariakit/test";

function getSelectionStart(element: Element | HTMLInputElement | null) {
  return element && "selectionStart" in element ? element.selectionStart : null;
}

function pageDialog() {
  return q.within(q.dialog("Pages"));
}

test("open popover with components tab initially selected, but not active", async () => {
  await click(q.combobox("Search pages"));
  expect(await q.dialog.wait("Pages")).toBeVisible();
  const dialog = pageDialog();
  expect(q.combobox()).toHaveAttribute("data-active-item");
  expect(dialog.tab("All 53")).toHaveAttribute("aria-selected", "false");
  expect(dialog.tab("Guide 6")).toHaveAttribute("aria-selected", "false");
  expect(dialog.tab("Examples 31")).toHaveAttribute("aria-selected", "false");
  expect(dialog.tab("Components 16")).toHaveAttribute("aria-selected", "true");
  expect(dialog.tab("Components 16")).not.toHaveFocus();
  expect(dialog.tab("Components 16")).not.toHaveAttribute("data-active-item");
  expect(dialog.tabpanel("All 53")).not.toBeInTheDocument();
  expect(dialog.tabpanel("Guide 6")).not.toBeInTheDocument();
  expect(dialog.tabpanel("Examples 31")).not.toBeInTheDocument();
  expect(dialog.tabpanel("Components 16")).toBeVisible();
  expect(dialog.option("Button")).toBeVisible();
  expect(dialog.option("Button")).not.toHaveFocus();
  expect(dialog.option("Button")).not.toHaveAttribute("data-active-item");
});

test("move through items and tabs with the keyboard", async () => {
  await press.Tab();
  expect(q.dialog("Pages")).not.toBeInTheDocument();
  await press.ArrowDown();
  expect(await q.dialog.wait("Pages")).toBeVisible();
  const dialog = pageDialog();
  expect(q.combobox()).toHaveAttribute("data-active-item");
  expect(dialog.tab("Components 16")).toHaveAttribute("aria-selected", "true");
  expect(dialog.tab("Components 16")).not.toHaveFocus();
  expect(dialog.tab("Components 16")).not.toHaveAttribute("data-active-item");
  await press.ArrowDown();
  expect(dialog.tab("Components 16")).toHaveFocus();
  expect(dialog.tab("Components 16")).toHaveAttribute("data-active-item");
  expect(q.combobox()).not.toHaveAttribute("data-active-item");
  expect(q.combobox()).toHaveFocus();
  await press.ArrowRight();
  expect(dialog.tab("Components 16")).not.toHaveFocus();
  expect(dialog.tab("Components 16")).not.toHaveAttribute("data-active-item");
  expect(dialog.tab("Components 16")).toHaveAttribute("aria-selected", "false");
  expect(dialog.tab("Examples 31")).toHaveFocus();
  expect(dialog.tab("Examples 31")).toHaveAttribute("data-active-item");
  expect(dialog.tab("Examples 31")).toHaveAttribute("aria-selected", "true");
  await press.ArrowRight();
  expect(q.combobox()).toHaveFocus();
  expect(dialog.tab("All 53")).toHaveFocus();
  await press.ArrowDown();
  await press.ArrowDown();
  expect(q.combobox()).toHaveFocus();
  expect(dialog.option("Animated Dialog")).toHaveFocus();
  await press.End();
  expect(dialog.tab("Examples 31")).toHaveFocus();
  await press.ArrowDown();
  expect(dialog.option("Animated Combobox")).toHaveFocus();
  await press.ArrowLeft();
  expect(dialog.tab("Components 16")).toHaveFocus();
});

test("move through items and tabs with a mouse", async () => {
  await click(q.button("Show popup"));
  const dialog = pageDialog();
  expect(q.combobox()).toHaveFocus();
  expect(q.combobox()).toHaveAttribute("data-active-item");
  await hover(await dialog.option.wait("Button"));
  expect(dialog.option("Button")).toHaveAttribute("data-active-item");
  await hover(dialog.tab("Guide 6"));
  expect(dialog.option("Button")).toHaveAttribute("data-active-item");
  expect(dialog.option("Button")).toHaveFocus();
  await click(dialog.tab("Guide 6"));
  expect(dialog.tab("Guide 6")).toHaveAttribute("aria-selected", "true");
  expect(dialog.option("Button")).not.toBeInTheDocument();
});

test("filter items and change tabs", async () => {
  await click(q.combobox());
  const dialog = pageDialog();
  await type("se");
  expect(dialog.option("Select")).toHaveFocus();
  expect(getSelectionStart(q.combobox())).toBe(2);
  await press.ArrowLeft();
  expect(getSelectionStart(q.combobox())).toBe(2);
  expect(dialog.tab("Guide 2")).toHaveFocus();
  expect(dialog.option("Component stores")).not.toHaveFocus();
  await press.Home();
  expect(getSelectionStart(q.combobox())).toBe(2);
});

test("filter items until there are no results and change tabs", async () => {
  await click(q.combobox());
  const dialog = pageDialog();
  await click(await dialog.tab.wait("Guide 6"));
  await type("abc");
  expect(dialog.tab("Guide 0")).toHaveFocus();
  expect(dialog.tab("Guide 0")).toHaveAttribute("aria-selected", "true");
  expect(dialog.tab("Guide 0")).toHaveAttribute("data-active-item");
  expect(dialog.tabpanel("Guide 0")).toBeVisible();
  expect(q.text('No pages found for ""')).toBeVisible();
  await press.ArrowLeft();
  expect(dialog.tab("Guide 0")).toBeDisabled();
  expect(dialog.tab("All 5")).toHaveAttribute("aria-selected", "true");
  expect(dialog.tab("All 5")).toHaveFocus();
  expect(dialog.option("Tab with React Router")).not.toHaveFocus();
  await press.ArrowRight();
  expect(dialog.tab("Examples 5")).toHaveAttribute("aria-selected", "true");
  expect(dialog.tab("Examples 5")).toHaveFocus();
  expect(dialog.option("Tab with React Router")).not.toHaveFocus();
});

test("clear input with keyboard", async () => {
  await press.Tab();
  await type("se");
  expect(q.option("Select")).toHaveFocus();
  await press.Tab();
  expect(q.button("Clear input")).toHaveFocus();
  expect(q.combobox()).not.toHaveFocus();
  await press.Enter();
  expect(q.combobox()).toHaveFocus();
  expect(q.combobox()).toHaveAttribute("data-active-item");
  expect(q.combobox()).toHaveValue("");
});

test("clear input with mouse", async () => {
  await click(q.combobox());
  await type("se");
  expect(q.option("Select")).toHaveFocus();
  await click(q.button("Clear input"));
  expect(q.combobox()).toHaveFocus();
  expect(q.combobox()).toHaveAttribute("data-active-item");
  expect(q.combobox()).toHaveValue("");
});

test("open the popover with arrow down after switching tabs", async () => {
  await click(q.combobox());
  expect(q.dialog("Pages")).toBeVisible();
  const dialog = pageDialog();
  await press.ArrowDown();
  expect(dialog.tab("Components 16")).toHaveFocus();
  await press.ArrowDown();
  expect(dialog.option("Button")).toHaveFocus();
  await press.ArrowRight();
  expect(dialog.tab("Examples 31")).toHaveFocus();
  await press.Escape();
  expect(q.combobox()).toHaveAttribute("data-active-item");
  expect(q.dialog("Pages")).not.toBeInTheDocument();
  await press.ArrowDown();
  expect(q.dialog("Pages")).toBeVisible();
  expect(pageDialog().tabpanel("Components 16")).toBeVisible();
  await press.ArrowDown();
  expect(pageDialog().tab("Components 16")).toHaveFocus();
});
