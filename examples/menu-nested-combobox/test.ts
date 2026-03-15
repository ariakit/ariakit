import { click, hover, press, q, type } from "@ariakit/test";

function menu() {
  return q.within(q.dialog("Actions"));
}

test("open/hide menu", async () => {
  await click(q.button("Actions"));
  expect(q.dialog("Actions")).toBeVisible();
  expect(q.combobox("Search actions...")).toHaveFocus();
  await click(q.button("Actions"));
  expect(q.dialog("Actions")).not.toBeInTheDocument();
  expect(q.button("Actions")).toHaveFocus();
});

test("open/hide menu with keyboard", async () => {
  await press.Tab();
  await press.Enter();
  expect(q.dialog("Actions")).toBeVisible();
  expect(q.combobox("Search actions...")).toHaveFocus();
  expect(q.option("Ask AI")).toHaveFocus();
  await press.Escape();
  expect(q.dialog("Actions")).not.toBeInTheDocument();
  expect(q.button("Actions")).toHaveFocus();
});

test("filter actions", async () => {
  await click(q.button("Actions"));
  const actions = menu();
  await type("de");
  expect(actions.option(/^Default\s*checked$/)).toHaveFocus();
  expect(actions.option(/^Default\s*checked$/)).toHaveAttribute(
    "data-active-item",
    "true",
  );
  await press.ArrowDown();
  expect(actions.option(/^Default background\s*checked$/)).toHaveFocus();
  await press.ArrowDown();
  expect(actions.option(/^Delete$/)).toHaveFocus();
  expect(actions.option(/^Delete$/)).toHaveAttribute(
    "data-active-item",
    "true",
  );
  await press.ArrowDown();
  expect(actions.option(/^Code\s*not checked$/)).toHaveFocus();
});

test("reset filter on hide", async () => {
  await click(q.button("Actions"));
  await type("a");
  expect(q.combobox("Search actions...")).toHaveValue("a");
  await click(document.body);
  expect(q.dialog("Actions")).not.toBeInTheDocument();
  expect(q.button("Actions")).toHaveFocus();
  await click(q.button("Actions"));
  expect(q.combobox("Search actions...")).toHaveValue("");
});

test("open/hide with search submenu", async () => {
  await click(q.button("Actions"));
  const option = q.option("Turn into page in");
  await hover(option);
  expect(option).toHaveFocus();
  expect(option).toHaveAttribute("aria-expanded", "false");
  expect(q.dialog("Turn into page in")).not.toBeInTheDocument();
  expect(await q.dialog.wait("Turn into page in")).toBeVisible();
  // Testing blurOnHoverEnd={false}
  await hover(document.body);
  expect(option).toHaveFocus();
  expect(option).toHaveAttribute("aria-expanded", "true");
  expect(q.combobox("Search actions...")).toHaveFocus();
  expect(q.dialog("Turn into page in")).toBeVisible();
  await press.ArrowRight();
  expect(q.combobox("Search pages to add in...")).toHaveFocus();
  expect(q.option("Private pages")).toHaveFocus();
  await press.ArrowLeft();
  expect(q.dialog("Turn into page in")).not.toBeInTheDocument();
  expect(option).toHaveFocus();
  expect(option).toHaveAttribute("aria-expanded", "false");
  expect(q.combobox("Search actions...")).toHaveFocus();
  await press.ArrowRight();
  expect(q.combobox("Search pages to add in...")).toHaveFocus();
  expect(q.option("Private pages")).toHaveFocus();
  await press.ArrowUp();
  await hover(q.option("Yearly Goals"));
  await press.ArrowDown();
  await hover(q.option("Private pages"));
  await press.Escape();
  expect(q.button("Actions")).toHaveFocus();
  expect(q.dialog("Actions")).not.toBeInTheDocument();
  expect(q.dialog("Turn into page in")).not.toBeInTheDocument();
});

test("tab in/out search menu", async () => {
  await click(q.button("Actions"));
  await click(q.option("Turn into page in"));
  await press.Tab();
  expect(q.combobox("Search pages to add in...")).toHaveFocus();
  expect(q.option("Private pages")).not.toHaveFocus();
  await press.ShiftTab();
  expect(q.option("Turn into page in")).toHaveFocus();
  expect(q.combobox("Search actions...")).toHaveFocus();
  expect(q.dialog("Turn into page in")).toBeVisible();
  await press.Tab();
  expect(q.combobox("Search pages to add in...")).toHaveFocus();
  expect(q.option("Private pages")).not.toHaveFocus();
});

test("set block type", async () => {
  await press.Tab();
  await press.Enter();
  await press.ArrowDown();
  await press.ArrowDown();
  await press.ArrowDown();
  await press.Enter();
  expect(q.menuitemradio("Text")).toHaveFocus();
  expect(q.menuitemradio("Text")).toHaveAttribute("aria-checked", "true");
  await type("cc");
  await press.Enter();
  expect(q.dialog("Actions")).not.toBeInTheDocument();
  expect(q.text("Callout")).toBeInTheDocument();
  await press.Enter();
  await type("Turn into");
  expect(menu().option(/^Text\s*not checked$/)).toHaveFocus();
  expect(menu().option(/^Callout\s*checked$/)).toBeInTheDocument();
  await press.Enter();
  expect(q.dialog("Actions")).not.toBeInTheDocument();
  expect(q.text("Text")).toBeInTheDocument();
});
