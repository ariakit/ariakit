import { press, q, type } from "@ariakit/test";

test("@ at the beginning", async () => {
  await press.Tab();
  expect(q.listbox()).not.toBeInTheDocument();
  await type("@");
  expect(q.combobox()).toHaveValue("@");
  expect(q.combobox()).toHaveFocus();
  expect(q.listbox()).toBeVisible();
  expect(q.option("diegohaz")).toHaveFocus();
  await press.Enter();
  expect(q.combobox()).toHaveValue("@diegohaz ");
});

test("# at the beginning", async () => {
  await press.Tab();
  await type("#");
  expect(q.option(/Critical dependency/)).toHaveFocus();
  await press.ArrowDown();
  await press.Enter();
  expect(q.combobox()).toHaveValue("#1247 ");
});

test(": at the beginning", async () => {
  await press.Tab();
  await type(":");
  expect(q.option(/smile$/)).toHaveFocus();
  await press.ArrowUp();
  await press.ArrowUp();
  await press.Enter();
  expect(q.combobox()).toHaveValue("😌 ");
});

test("typing on the textarea", async () => {
  await press.Tab();
  await type("Hi @");
  await press.ArrowDown();
  await press.Enter();
  expect(q.combobox()).toHaveValue("Hi @tcodes0 ");
  await type("@ma");
  await press.Enter();
  expect(q.combobox()).toHaveValue("Hi @tcodes0 @matheus1lva ");
  await type("\b\n\n#lat");
  await press.ArrowLeft();
  await expect(q.listbox()).not.toBeInTheDocument();
  await type("\b");
  await expect(q.listbox()).not.toBeInTheDocument();
  await type("\b");
  await expect(q.listbox()).toBeVisible();
  await press.Enter();
  expect(q.combobox()).toHaveValue("Hi @tcodes0 @matheus1lva\n\n#1253 t");
});
