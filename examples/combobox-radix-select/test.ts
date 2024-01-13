import { click, hover, press, q, type } from "@ariakit/test";

test("open/close select with the mouse", async () => {
  expect(q.dialog()).not.toBeInTheDocument();
  await click(q.combobox("Language"));
  expect(q.dialog()).toBeInTheDocument();
  expect(q.combobox("Search languages")).toHaveFocus();
  await click(document.body);
  expect(q.dialog()).not.toBeInTheDocument();
  expect(q.combobox()).toHaveFocus();
  expect(q.combobox()).toHaveTextContent("Select a language");
});

test("open/close select with the keyboard", async () => {
  expect(q.dialog()).not.toBeInTheDocument();
  await press.Tab();
  await press.Enter();
  expect(q.dialog()).toBeInTheDocument();
  expect(q.combobox("Search languages")).toHaveFocus();
  await press.Escape();
  expect(q.dialog()).not.toBeInTheDocument();
  expect(q.combobox()).toHaveFocus();
  expect(q.combobox()).toHaveTextContent("Select a language");
});

test("select an option with the mouse", async () => {
  await click(q.combobox());
  expect(q.dialog()).toBeInTheDocument();
  expect(q.combobox("Search languages")).toHaveFocus();
  await click(q.option("Thai"));
  expect(q.dialog()).not.toBeInTheDocument();
  expect(q.combobox()).toHaveFocus();
  expect(q.combobox()).toHaveTextContent("Thai");
});

test("select an option with the keyboard", async () => {
  await press.Tab();
  await press.Space();
  expect(q.dialog()).toBeInTheDocument();
  expect(q.combobox("Search languages")).toHaveFocus();
  await press.ArrowDown();
  await press.ArrowDown();
  await press.ArrowDown();
  await press.Enter();
  expect(q.dialog()).not.toBeInTheDocument();
  expect(q.combobox()).toHaveFocus();
  expect(q.combobox()).toHaveTextContent("Spanish");
});

test("search and select", async () => {
  await click(q.combobox());
  expect(q.combobox("Search languages")).toHaveFocus();
  await type("po");
  expect(q.option("Polish")).toHaveFocus();
  expect(q.option("Polish")).toHaveAttribute("data-active-item", "true");
  await press.ArrowDown();
  expect(q.option("Portuguese")).toHaveFocus();
  expect(q.option("Polish")).not.toHaveAttribute("data-active-item");
  expect(q.option("Portuguese")).toHaveAttribute("data-active-item", "true");
  await press.Enter();
  expect(q.dialog()).not.toBeInTheDocument();
  expect(q.combobox()).toHaveFocus();
  expect(q.combobox()).toHaveTextContent("Portuguese");
});

test("search and select, then search again", async () => {
  await click(q.combobox());
  await type("ru");
  await press.Enter();
  expect(q.combobox("Language")).toHaveTextContent("Russian");
  await click(q.combobox());
  expect(q.option("Russian")).toHaveFocus();
  expect(q.option("Russian")).toHaveAttribute("data-active-item", "true");
  await type("chi");
  expect(q.option("Chinese")).toHaveFocus();
  expect(q.option("Chinese")).toHaveAttribute("data-active-item", "true");
  expect(q.option("Russian")).not.toHaveAttribute("data-active-item");
  expect(q.option("Russian")).toHaveAttribute("aria-selected", "true");
  await type("\b\b\b\b");
  expect(q.option("English")).toHaveFocus();
  expect(q.option("English")).toHaveAttribute("data-active-item", "true");
  expect(q.option("Russian")).toHaveAttribute("aria-selected", "true");
});

test("hover over option", async () => {
  await click(q.combobox());
  await hover(q.option("German"));
  expect(q.combobox()).toHaveFocus();
  expect(q.option("German")).toHaveFocus();
  expect(q.option("German")).toHaveAttribute("data-active-item", "true");
  await hover(document.body);
  expect(q.option("German")).toHaveFocus();
  expect(q.option("German")).toHaveAttribute("data-active-item", "true");
  await press.ArrowDown();
  expect(q.option("Spanish")).toHaveFocus();
  expect(q.option("Spanish")).toHaveAttribute("data-active-item", "true");
});
