import { click, press, q, type } from "@ariakit/test";

test("show/hide on click", async () => {
  expect(q.dialog()).not.toBeInTheDocument();
  await click(q.combobox("Favorite fruit"));
  expect(q.dialog()).toBeVisible();
  expect(q.combobox("Search...")).toHaveFocus();
  expect(q.option("Apple")).toHaveFocus();
  await click(q.combobox("Favorite fruit"));
  expect(q.dialog()).not.toBeInTheDocument();
  expect(q.combobox("Favorite fruit")).toHaveFocus();
});

test("show/hide on enter", async () => {
  await press.Tab();
  await press.Enter();
  expect(q.dialog()).toBeVisible();
  expect(q.combobox("Search...")).toHaveFocus();
  expect(q.option("Apple")).toHaveFocus();
  await press.ShiftTab();
  expect(q.dialog()).toBeVisible();
  expect(q.combobox("Favorite fruit")).toHaveFocus();
  await press.Enter();
  expect(q.dialog()).not.toBeInTheDocument();
  expect(q.combobox("Favorite fruit")).toHaveFocus();
});

test("show/hide on space", async () => {
  await press.Tab();
  await press.Space();
  expect(q.dialog()).toBeVisible();
  expect(q.combobox("Search...")).toHaveFocus();
  expect(q.option("Apple")).toHaveFocus();
  await press.ShiftTab();
  expect(q.dialog()).toBeVisible();
  expect(q.combobox("Favorite fruit")).toHaveFocus();
  await press.Space();
  expect(q.dialog()).not.toBeInTheDocument();
  expect(q.combobox("Favorite fruit")).toHaveFocus();
});

test("show on arrow down", async () => {
  await press.Tab();
  await press.ArrowDown();
  expect(q.dialog()).toBeVisible();
  expect(q.combobox("Search...")).toHaveFocus();
  expect(q.option("Apple")).toHaveFocus();
});

test("show on arrow up", async () => {
  await press.Tab();
  await press.ArrowUp();
  expect(q.dialog()).toBeVisible();
  expect(q.combobox("Search...")).toHaveFocus();
  expect(q.option("Apple")).toHaveFocus();
});

test("type on combobox", async () => {
  await click(q.combobox("Favorite fruit"));
  await type("gr");
  expect(q.combobox("Search...")).toHaveValue("gr");
  expect(q.option("Grape")).toHaveFocus();
  await press.ArrowDown();
  await press.Enter();
  expect(q.combobox("Favorite fruit")).toHaveTextContent("Green apple");
  await press.Enter();
  expect(q.combobox("Search...")).toHaveValue("");
  expect(q.option("Green apple")).toHaveFocus();
  await type("o");
  expect(q.option("Onion")).toHaveFocus();
});

test("focus is restored after filtering and re-opening", async () => {
  await press.Tab();
  await press.Enter();
  await type("f");
  expect(q.option("Fish")).toHaveFocus();
  await press.Escape();
  expect(q.combobox("Favorite fruit")).toHaveFocus();
  await press.Enter();
  expect(q.combobox("Search...")).toHaveFocus();
  expect(q.option("Apple")).toHaveFocus();
  await type("f");
  expect(q.option("Fish")).toHaveFocus();
  await press.Escape();
  expect(q.combobox("Favorite fruit")).toHaveFocus();
  await press.Enter();
  expect(q.combobox("Search...")).toHaveFocus();
  expect(q.option("Apple")).toHaveFocus();
});

test("autoSelect works even with autoFocus", async () => {
  await click(q.combobox("Favorite fruit"));
  await type("p");
  expect(q.option("Pasta")).toHaveFocus();
});

test("select value after filtering", async () => {
  await click(q.combobox("Favorite fruit"));
  await type("ba");
  await click(q.option("Banana"));
  expect(q.combobox("Favorite fruit")).toHaveTextContent("Banana");
});
