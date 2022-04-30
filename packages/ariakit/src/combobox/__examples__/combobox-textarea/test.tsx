import { getByRole, press, queryByRole, render, type } from "ariakit-test";
import Example from ".";

const getTextarea = () => getByRole("combobox");
const getPopover = () => queryByRole("listbox", { hidden: true });
const getOption = (name: string | RegExp) => getByRole("option", { name });

test("@ at the beginning", async () => {
  render(<Example />);
  await press.Tab();
  expect(getPopover()).not.toBeInTheDocument();
  await type("@");
  expect(getTextarea()).toHaveValue("@");
  expect(getTextarea()).toHaveFocus();
  expect(getPopover()).toBeVisible();
  expect(getOption("diegohaz")).toHaveFocus();
  await press.Enter();
  expect(getTextarea()).toHaveValue("@diegohaz ");
});

test("# at the beginning", async () => {
  render(<Example />);
  await press.Tab();
  await type("#");
  expect(getOption(/Critical dependency/)).toHaveFocus();
  await press.ArrowDown();
  await press.Enter();
  expect(getTextarea()).toHaveValue("#1247 ");
});

test(": at the beginning", async () => {
  render(<Example />);
  await press.Tab();
  await type(":");
  expect(getOption(/smile$/)).toHaveFocus();
  await press.ArrowUp();
  await press.ArrowUp();
  await press.Enter();
  expect(getTextarea()).toHaveValue("😌 ");
});

test("typing on the textarea", async () => {
  render(<Example />);
  await press.Tab();
  await type("Hi @");
  await press.ArrowDown();
  await press.Enter();
  expect(getTextarea()).toHaveValue("Hi @tcodes0 ");
  await type("@ma");
  await press.Enter();
  expect(getTextarea()).toHaveValue("Hi @tcodes0 @matheus1lva ");
  await type("\b\n\n#lat");
  await press.ArrowLeft();
  await expect(getPopover()).not.toBeInTheDocument();
  await type("\b");
  await expect(getPopover()).not.toBeInTheDocument();
  await type("\b");
  await expect(getPopover()).toBeVisible();
  await press.ArrowUp();
  await press.Enter();
  expect(getTextarea()).toHaveValue("Hi @tcodes0 @matheus1lva\n\n#1018 t");
});
