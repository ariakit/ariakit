import { click, hover, press, q, type } from "@ariakit/test";

function getSelectionStart(element: Element | HTMLInputElement | null) {
  return element && "selectionStart" in element ? element.selectionStart : null;
}

test("open popover with components tab initially selected, but not active", async () => {
  await click(q.combobox("Search pages"));
  expect(q.dialog("Pages")).toBeVisible();
  expect(q.combobox()).toHaveAttribute("data-active-item", "true");
  expect(q.tab("All 53")).toHaveAttribute("aria-selected", "false");
  expect(q.tab("Guide 6")).toHaveAttribute("aria-selected", "false");
  expect(q.tab("Examples 31")).toHaveAttribute("aria-selected", "false");
  expect(q.tab("Components 16")).toHaveAttribute("aria-selected", "true");
  expect(q.tab("Components 16")).not.toHaveFocus();
  expect(q.tab("Components 16")).not.toHaveAttribute("data-active-item");
  expect(q.tabpanel("All 53")).not.toBeInTheDocument();
  expect(q.tabpanel("Guide 6")).not.toBeInTheDocument();
  expect(q.tabpanel("Examples 31")).not.toBeInTheDocument();
  expect(q.tabpanel("Components 16")).toBeVisible();
  expect(q.option("Button")).toBeVisible();
  expect(q.option("Button")).not.toHaveFocus();
  expect(q.option("Button")).not.toHaveAttribute("data-active-item");
});

test("move through items and tabs with the keyboard", async () => {
  await press.Tab();
  expect(q.dialog("Pages")).not.toBeInTheDocument();
  await press.ArrowDown();
  expect(q.dialog("Pages")).toBeVisible();
  expect(q.combobox()).toHaveAttribute("data-active-item", "true");
  expect(q.tab("Components 16")).toHaveAttribute("aria-selected", "true");
  expect(q.tab("Components 16")).not.toHaveFocus();
  expect(q.tab("Components 16")).not.toHaveAttribute("data-active-item");
  await press.ArrowDown();
  expect(q.tab("Components 16")).toHaveFocus();
  expect(q.tab("Components 16")).toHaveAttribute("data-active-item", "");
  expect(q.combobox()).not.toHaveAttribute("data-active-item");
  expect(q.combobox()).toHaveFocus();
  await press.ArrowRight();
  expect(q.tab("Components 16")).not.toHaveFocus();
  expect(q.tab("Components 16")).not.toHaveAttribute("data-active-item");
  expect(q.tab("Components 16")).toHaveAttribute("aria-selected", "false");
  expect(q.tab("Examples 31")).toHaveFocus();
  expect(q.tab("Examples 31")).toHaveAttribute("data-active-item", "");
  expect(q.tab("Examples 31")).toHaveAttribute("aria-selected", "true");
  await press.ArrowRight();
  expect(q.combobox()).toHaveFocus();
  expect(q.tab("All 53")).toHaveFocus();
  await press.ArrowDown();
  await press.ArrowDown();
  expect(q.combobox()).toHaveFocus();
  expect(q.option("Animated Dialog")).toHaveFocus();
  await press.End();
  expect(q.tab("Examples 31")).toHaveFocus();
  await press.ArrowDown();
  expect(q.option("Animated Combobox")).toHaveFocus();
  await press.ArrowLeft();
  expect(q.tab("Components 16")).toHaveFocus();
});

test("move through items and tabs with a mouse", async () => {
  await click(q.button("Show popup"));
  expect(q.combobox()).toHaveFocus();
  expect(q.combobox()).toHaveAttribute("data-active-item", "true");
  await hover(q.option("Button"));
  expect(q.option("Button")).toHaveAttribute("data-active-item", "");
  await hover(q.tab("Guide 6"));
  expect(q.option("Button")).toHaveAttribute("data-active-item", "");
  expect(q.option("Button")).toHaveFocus();
  await click(q.tab("Guide 6"));
  expect(q.tab("Guide 6")).toHaveAttribute("aria-selected", "true");
  expect(q.option("Button")).not.toBeInTheDocument();
});

test("filter items and change tabs", async () => {
  await click(q.combobox());
  await type("se");
  expect(q.option("Select")).toHaveFocus();
  expect(getSelectionStart(q.combobox())).toBe(2);
  await press.ArrowLeft();
  expect(getSelectionStart(q.combobox())).toBe(2);
  expect(q.tab("Guide 2")).toHaveFocus();
  expect(q.option("Component stores")).not.toHaveFocus();
  await press.Home();
  expect(getSelectionStart(q.combobox())).toBe(2);
});

test("filter items until there are no results and change tabs", async () => {
  await click(q.combobox());
  await click(q.tab("Guide 6"));
  await type("abc");
  expect(q.tab("Guide 0")).not.toBeDisabled();
  expect(q.tab("Guide 0")).toHaveFocus();
  expect(q.tab("Guide 0")).toHaveAttribute("aria-selected", "true");
  expect(q.tab("Guide 0")).toHaveAttribute("data-active-item", "");
  expect(q.tabpanel("Guide 0")).toBeVisible();
  expect(q.text('No pages found for ""')).toBeVisible();
  await press.ArrowLeft();
  expect(q.tab("Guide 0")).toBeDisabled();
  expect(q.tab("All 5")).toHaveAttribute("aria-selected", "true");
  expect(q.tab("All 5")).toHaveFocus();
  expect(q.option("Tab with React Router")).not.toHaveFocus();
  await press.ArrowRight();
  expect(q.tab("Examples 5")).toHaveAttribute("aria-selected", "true");
  expect(q.tab("Examples 5")).toHaveFocus();
  expect(q.option("Tab with React Router")).not.toHaveFocus();
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
  expect(q.combobox()).toHaveAttribute("data-active-item", "true");
  expect(q.combobox()).toHaveValue("");
});

test("clear input with mouse", async () => {
  await click(q.combobox());
  await type("se");
  expect(q.option("Select")).toHaveFocus();
  await click(q.button("Clear input"));
  expect(q.combobox()).toHaveFocus();
  expect(q.combobox()).toHaveAttribute("data-active-item", "true");
  expect(q.combobox()).toHaveValue("");
});
