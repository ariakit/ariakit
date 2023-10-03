import { click, hover, press, q, sleep, type } from "@ariakit/test";

test("default value", () => {
  expect(q.combobox()).toHaveTextContent("Apple");
});

test("click on label", async () => {
  expect(q.combobox()).not.toHaveFocus();
  await click(q.text("Favorite fruit"));
  expect(q.combobox()).toHaveFocus();
  expect(q.listbox()).not.toBeInTheDocument();
});

test("show/hide on click", async () => {
  expect(q.listbox()).not.toBeInTheDocument();
  await click(q.combobox());
  expect(q.listbox()).toBeVisible();
  expect(q.listbox()).toHaveFocus();
  expect(q.option("Apple")).toHaveFocus();
  expect(q.option("Apple")).toHaveAttribute("aria-selected", "true");
  expect(q.combobox()).toHaveTextContent("Apple");
  await click(q.combobox());
  expect(q.listbox()).not.toBeInTheDocument();
  expect(q.combobox()).toHaveFocus();
  expect(q.combobox()).toHaveTextContent("Apple");
});

test("show/hide on enter", async () => {
  await press.Tab();
  await press.Enter();
  expect(q.listbox()).toBeVisible();
  expect(q.listbox()).toHaveFocus();
  expect(q.option("Apple")).toHaveFocus();
  expect(q.combobox()).toHaveTextContent("Apple");
  await press.ShiftTab();
  await press.Enter();
  expect(q.listbox()).not.toBeInTheDocument();
  expect(q.combobox()).toHaveTextContent("Apple");
});

test("show/hide on space", async () => {
  await press.Tab();
  await press.Space();
  expect(q.listbox()).toBeVisible();
  expect(q.listbox()).toHaveFocus();
  expect(q.option("Apple")).toHaveFocus();
  expect(q.combobox()).toHaveTextContent("Apple");
  await press.ShiftTab();
  await press.Space();
  expect(q.listbox()).not.toBeInTheDocument();
  expect(q.combobox()).toHaveTextContent("Apple");
});

test("show on arrow keys", async () => {
  await press.Tab();
  await press.ArrowDown();
  expect(q.listbox()).toBeVisible();
  expect(q.listbox()).toHaveFocus();
  expect(q.option("Apple")).toHaveFocus();
  await press.ShiftTab();
  expect(q.combobox()).toHaveFocus();
  expect(q.option("Apple")).not.toHaveFocus();
  await press.ArrowUp();
  expect(q.listbox()).toBeVisible();
  expect(q.listbox()).toHaveFocus();
  expect(q.option("Apple")).toHaveFocus();
});

test("hide on escape", async () => {
  await click(q.combobox());
  expect(q.listbox()).toBeVisible();
  await press.Escape();
  expect(q.listbox()).not.toBeInTheDocument();
});

test("hide on click outside", async () => {
  await click(q.combobox());
  expect(q.listbox()).toBeVisible();
  await click(document.body);
  expect(q.listbox()).not.toBeInTheDocument();
});

test("hide on click on label", async () => {
  await click(q.combobox());
  expect(q.listbox()).toBeVisible();
  await click(q.text("Favorite fruit"));
  expect(q.combobox()).toHaveFocus();
  expect(q.listbox()).not.toBeInTheDocument();
});

test("navigate through items with keyboard", async () => {
  await press.Tab();
  await press.ArrowDown();
  expect(q.option("Apple")).toHaveFocus();
  expect(q.option("Apple")).toHaveAttribute("aria-selected", "true");
  await press.ArrowDown();
  expect(q.option("Banana")).toHaveFocus();
  expect(q.option("Apple")).toHaveAttribute("aria-selected", "true");
  expect(q.option("Banana")).toHaveAttribute("aria-selected", "false");
  await press.ArrowDown();
  expect(q.option("Orange")).toHaveFocus();
  expect(q.option("Apple")).toHaveAttribute("aria-selected", "true");
  expect(q.option("Orange")).toHaveAttribute("aria-selected", "false");
  await press.ArrowUp();
  expect(q.option("Banana")).toHaveFocus();
  await press.ArrowRight();
  expect(q.option("Banana")).toHaveFocus();
  await press.ArrowLeft();
  expect(q.option("Banana")).toHaveFocus();
  await press.End();
  expect(q.option("Orange")).toHaveFocus();
  await press.ArrowDown();
  expect(q.option("Orange")).toHaveFocus();
  await press.Home();
  expect(q.option("Apple")).toHaveFocus();
  await press.ArrowUp();
  expect(q.option("Apple")).toHaveFocus();
});

test("typeahead open", async () => {
  await press.Tab();
  await press.Enter();
  await type("b");
  expect(q.option("Banana")).toHaveFocus();
  expect(q.option("Apple")).toHaveAttribute("aria-selected", "true");
  expect(q.option("Banana")).toHaveAttribute("aria-selected", "false");
  await sleep(600);
  await type("ora");
  expect(q.option("Orange")).toHaveFocus();
  expect(q.option("Apple")).toHaveAttribute("aria-selected", "true");
  expect(q.option("Orange")).toHaveAttribute("aria-selected", "false");
});

test("typeahead hidden", async () => {
  await press.Tab();
  await type("g");
  expect(q.combobox()).toHaveTextContent("Apple");
  expect(q.listbox()).not.toBeInTheDocument();
  await sleep(600);
  await type("ora");
  expect(q.combobox()).toHaveTextContent("Orange");
  expect(q.listbox()).not.toBeInTheDocument();
});

test("select with enter", async () => {
  await press.Tab();
  await press.Enter();
  await press.ArrowDown();
  await press.Enter();
  expect(q.combobox()).toHaveTextContent("Banana");
  expect(q.listbox()).not.toBeInTheDocument();
  await press.Enter();
  expect(q.listbox()).toBeVisible();
  expect(q.option("Banana")).toHaveFocus();
  expect(q.option("Apple")).toHaveAttribute("aria-selected", "false");
  expect(q.option("Banana")).toHaveAttribute("aria-selected", "true");
});

test("select with space", async () => {
  await press.Tab();
  await press.Space();
  await press.ArrowDown();
  await press.ArrowDown();
  await press.Space();
  expect(q.combobox()).toHaveTextContent("Orange");
  expect(q.listbox()).not.toBeInTheDocument();
  await press.Space();
  expect(q.listbox()).toBeVisible();
  expect(q.option("Orange")).toHaveFocus();
  expect(q.option("Apple")).toHaveAttribute("aria-selected", "false");
  expect(q.option("Orange")).toHaveAttribute("aria-selected", "true");
});

test("select with click", async () => {
  await click(q.combobox());
  await click(q.option("Banana"));
  expect(q.combobox()).toHaveTextContent("Banana");
  expect(q.listbox()).not.toBeInTheDocument();
  await click(q.combobox());
  expect(q.option("Apple")).toHaveAttribute("aria-selected", "false");
  expect(q.option("Banana")).toHaveAttribute("aria-selected", "true");
  await click(q.option("Grape"));
  expect(q.combobox()).toHaveTextContent("Banana");
  expect(q.listbox()).toBeVisible();
  await click(q.option("Orange"));
  expect(q.combobox()).toHaveTextContent("Orange");
  expect(q.listbox()).not.toBeInTheDocument();
});

test("hover on item", async () => {
  await click(q.combobox());
  await hover(q.option("Banana"));
  expect(q.option("Banana")).toHaveFocus();
  expect(q.combobox()).toHaveTextContent("Apple");
  expect(q.option("Apple")).toHaveAttribute("aria-selected", "true");
  expect(q.option("Banana")).toHaveAttribute("aria-selected", "false");
  await hover(q.option("Grape"));
  expect(q.option("Banana")).not.toHaveFocus();
  expect(q.listbox()).toHaveFocus();
  expect(q.combobox()).toHaveTextContent("Apple");
  expect(q.option("Apple")).toHaveAttribute("aria-selected", "true");
});
