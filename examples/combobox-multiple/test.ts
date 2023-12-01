import { click, press, q, type } from "@ariakit/test";

test("default checked", async () => {
  await click(q.combobox());
  expect(q.option("Bacon")).toHaveAttribute("aria-selected", "true");
});

test("check/uncheck with click", async () => {
  await click(q.combobox());
  await click(q.option("Burger"));
  await click(q.option("Banana"));
  expect(q.option("Burger")).toHaveAttribute("aria-selected", "true");
  expect(q.option("Banana")).toHaveAttribute("aria-selected", "true");
  await click(q.option("Burger"));
  expect(q.option("Burger")).toHaveAttribute("aria-selected", "false");
  await click(q.option("Banana"));
  expect(q.option("Banana")).toHaveAttribute("aria-selected", "false");
});

test("check/uncheck with enter", async () => {
  await press.Tab();
  await press.ArrowDown();
  await press.ArrowDown();
  await press.ArrowDown();
  await press.ArrowDown();
  expect(q.option("Banana")).toHaveAttribute("aria-selected", "false");
  await press.Enter();
  expect(q.option("Banana")).toHaveAttribute("aria-selected", "true");
  await press.Enter();
  expect(q.option("Banana")).toHaveAttribute("aria-selected", "false");
});

test("check/uncheck item after filtering", async () => {
  await press.Tab();
  await type("b");
  expect(q.option("Apple")).not.toBeInTheDocument();
  expect(q.option("Bacon")).toHaveAttribute("aria-selected", "true");
  await press.ArrowDown();
  await press.Enter();
  expect(q.option("Apple")).toHaveAttribute("aria-selected", "false");
  expect(q.option("Bacon")).toHaveAttribute("aria-selected", "false");
  expect(q.combobox()).toHaveValue("");
  await type("ap");
  await press.ArrowUp();
  await press.Enter();
  expect(q.option("Pineapple")).toHaveAttribute("aria-selected", "true");
  expect(q.combobox()).toHaveValue("");
  await press.ArrowDown();
  expect(q.option("Pizza")).toHaveFocus();
});

test("open with keyboard, then try to open again", async () => {
  await press.Tab();
  await press.ArrowDown();
  expect(q.listbox()).toBeVisible();
  await press.ArrowDown();
  expect(q.option("Apple")).toHaveFocus();
  await press.Escape();
  expect(q.listbox()).not.toBeInTheDocument();
  expect(q.combobox()).toHaveFocus();
  await press.ArrowDown();
  expect(q.listbox()).toBeVisible();
  await press.ArrowDown();
  expect(q.option("Apple")).toHaveFocus();
});

test("no result", async () => {
  await press.Tab();
  await type("zzz");
  expect(q.text("No results found")).toBeVisible();
});
