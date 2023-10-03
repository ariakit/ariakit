import { click, hover, press, q, type } from "@ariakit/test";

test("show/hide on click", async () => {
  expect(q.dialog()).not.toBeInTheDocument();
  await click(q.button("Add block"));
  expect(q.dialog()).toBeVisible();
  expect(q.dialog()).not.toHaveFocus();
  expect(q.combobox()).toHaveFocus();
  expect(q.option("Paragraph")).not.toHaveFocus();
  await click(q.button("Add block"));
  expect(q.dialog()).not.toBeInTheDocument();
  expect(q.button("Add block")).toHaveFocus();
});

test("show/hide on enter", async () => {
  await press.Tab();
  expect(q.dialog()).not.toBeInTheDocument();
  await press.Enter();
  expect(q.dialog()).toBeVisible();
  expect(q.dialog()).not.toHaveFocus();
  expect(q.combobox()).toHaveFocus();
  expect(q.option("Paragraph")).toHaveFocus();
  await press.ShiftTab();
  expect(q.button("Add block")).toHaveFocus();
  await press.Enter();
  expect(q.dialog()).not.toBeInTheDocument();
  expect(q.button("Add block")).toHaveFocus();
});

test("show/hide on space", async () => {
  await press.Tab();
  await press.Space();
  expect(q.dialog()).toBeVisible();
  expect(q.dialog()).not.toHaveFocus();
  expect(q.combobox()).toHaveFocus();
  expect(q.option("Paragraph")).toHaveFocus();
  await press.ShiftTab();
  expect(q.button("Add block")).toHaveFocus();
  await press.Space();
  expect(q.dialog()).not.toBeInTheDocument();
  expect(q.button("Add block")).toHaveFocus();
});

test("show on arrow down", async () => {
  await press.Tab();
  await press.ArrowDown();
  expect(q.dialog()).toBeVisible();
  expect(q.dialog()).not.toHaveFocus();
  expect(q.combobox()).toHaveFocus();
  expect(q.option("Paragraph")).toHaveFocus();
});

test("show on arrow up", async () => {
  await press.Tab();
  await press.ArrowUp();
  expect(q.dialog()).toBeVisible();
  expect(q.dialog()).not.toHaveFocus();
  expect(q.combobox()).toHaveFocus();
  expect(q.option("Tag Cloud")).toHaveFocus();
});

test("type on combobox", async () => {
  await click(q.button("Add block"));
  await type("c");
  expect(q.option("Classic")).toHaveFocus();
  await type("o");
  expect(q.option("Classic")).not.toBeInTheDocument();
  expect(q.option("Code")).toHaveFocus();
  await type("ver");
  expect(q.combobox()).toHaveValue("cover");
  expect(q.option("Code")).not.toBeInTheDocument();
  expect(q.option("Cover")).toHaveFocus();
  await press.Escape();
  expect(q.button("Add block")).toHaveFocus();
  await click(q.button("Add block"));
  expect(q.combobox()).toHaveValue("");
});

test("backspace on combobox", async () => {
  await press.Tab();
  await press.Enter();
  expect(q.option("Paragraph")).toHaveFocus();
  await type("g");
  expect(q.option("Gallery")).toHaveFocus();
  await type("r");
  expect(q.option("Group")).toHaveFocus();
  await type("\b");
  expect(q.combobox()).toHaveValue("g");
  expect(q.option("Gallery")).toHaveFocus();
  await type("\b");
  expect(q.combobox()).toHaveValue("");
  expect(q.option("Paragraph")).toHaveFocus();
});

test("move through items with keyboard", async () => {
  await press.Tab();
  await press.ArrowDown();
  expect(q.option("Paragraph")).toHaveFocus();
  await press.ArrowDown();
  expect(q.option("Heading")).toHaveFocus();
  await press.ArrowDown();
  expect(q.option("List")).toHaveFocus();
  await type("se");
  expect(q.option("Separator")).toHaveFocus();
  await press.ArrowDown();
  expect(q.option("Search")).toHaveFocus();
  await press.ArrowDown();
  expect(q.option("Verse")).toHaveFocus();
  await press.Escape();
  await press.ArrowDown();
  expect(q.option("Paragraph")).toHaveFocus();
});

test("move through items with mouse and keyboard", async () => {
  await click(q.button("Add block"));
  await press.ArrowDown();
  expect(q.option("Paragraph")).toHaveFocus();
  expect(q.option("Paragraph")).toHaveAttribute("data-focus-visible");
  await hover(q.option("List"));
  expect(q.combobox()).toHaveFocus();
  expect(q.option("List")).toHaveFocus();
  expect(q.option("List")).not.toHaveAttribute("data-focus-visible");
  await hover(q.option("Classic"));
  expect(q.combobox()).toHaveFocus();
  expect(q.option("Classic")).toHaveFocus();
  expect(q.option("Classic")).not.toHaveAttribute("data-focus-visible");
  await press.ArrowUp();
  expect(q.combobox()).toHaveFocus();
  expect(q.option("Quote")).toHaveFocus();
  expect(q.option("Quote")).toHaveAttribute("data-focus-visible");
});
