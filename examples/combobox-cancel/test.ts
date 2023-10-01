import { click, dispatch, press, q, sleep, type } from "@ariakit/test";

test("clear input with mouse", async () => {
  await click(q.combobox());
  expect(q.combobox()).toHaveValue("");
  expect(q.listbox()).toBeVisible();
  await click(q.option("Apple"));
  expect(q.combobox()).toHaveFocus();
  expect(q.combobox()).toHaveValue("Apple");
  await click(q.button("Clear input"));
  expect(q.combobox()).toHaveValue("");
  expect(q.combobox()).toHaveFocus();
});

test("clear input with mouse after typing", async () => {
  await press.Tab();
  await type("a");
  expect(q.combobox()).toHaveValue("a");
  await click(q.button("Clear input"));
  expect(q.combobox()).toHaveValue("");
  expect(q.combobox()).toHaveFocus();
  expect(q.listbox()).toBeVisible();
});

test("clear input with keyboard (tab + enter)", async () => {
  await click(q.combobox());
  expect(q.combobox()).toHaveValue("");
  await click(q.option("Apple"));
  expect(q.combobox()).toHaveFocus();
  expect(q.combobox()).toHaveValue("Apple");
  await press.Tab();
  await press.Enter();
  expect(q.combobox()).toHaveValue("");
  expect(q.combobox()).toHaveFocus();
});

test("clear input with keyboard (tab + space)", async () => {
  await click(q.combobox());
  expect(q.combobox()).toHaveValue("");
  await click(q.option("Apple"));
  expect(q.combobox()).toHaveFocus();
  expect(q.combobox()).toHaveValue("Apple");
  await press.Tab();
  await press.Space();
  expect(q.combobox()).toHaveValue("");
  expect(q.combobox()).toHaveFocus();
});

test("clear input with keyboard after typing", async () => {
  await press.Tab();
  await type("a");
  expect(q.combobox()).toHaveValue("a");
  await press.Tab();
  await press.Enter();
  expect(q.combobox()).toHaveValue("");
  expect(q.combobox()).toHaveFocus();
  expect(q.listbox()).toBeVisible();
});

test("https://github.com/ariakit/ariakit/issues/1652", async () => {
  await press.Tab();
  await type("a");
  await press.Tab();
  await press.Enter();
  expect(q.option("Apple")).not.toHaveFocus();
  await type("a");
  await click(q.button("Clear input"));
  expect(q.option("Apple")).not.toHaveFocus();
});

test("composition text", async () => {
  await dispatch.compositionStart(q.combobox());
  await type("'", q.combobox(), { isComposing: true });
  expect(q.option("Apple")).not.toHaveFocus();
  await type("á", q.combobox(), { isComposing: true });
  await dispatch.compositionEnd(q.combobox());
  await sleep();
  expect(q.combobox()).toHaveValue("á");
  expect(q.option("Apple")).toHaveFocus();
});
