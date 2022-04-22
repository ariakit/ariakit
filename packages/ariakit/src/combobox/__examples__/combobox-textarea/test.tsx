import {
  getByRole,
  press,
  queryByRole,
  render,
  type,
} from "ariakit-test-utils";
import Example from ".";

const getTextarea = () => getByRole("combobox");
const getPopover = () => queryByRole("listbox", { hidden: true });
const getOption = (name: string | RegExp) => getByRole("option", { name });

test("show mention popover when typing @ at the beginning", async () => {
  render(<Example />);
  await press.Tab();
  expect(getPopover()).not.toBeInTheDocument();
  await type("@");
  expect(getTextarea()).toHaveValue("@");
  expect(getTextarea()).toHaveFocus();
  expect(getPopover()).toBeVisible();
  expect(getOption("diegohaz")).toHaveFocus();
});

test("show issue popover when typing # at the beginning", async () => {
  render(<Example />);
  await press.Tab();
  expect(getPopover()).not.toBeInTheDocument();
  await type("#");
  expect(getTextarea()).toHaveValue("#");
  expect(getTextarea()).toHaveFocus();
  expect(getPopover()).toBeVisible();
  expect(getOption(/^#1253/)).toHaveFocus();
});

test("show emoji popover when typing : at the beginning", async () => {
  render(<Example />);
  await press.Tab();
  expect(getPopover()).not.toBeInTheDocument();
  await type(":");
  expect(getTextarea()).toHaveValue(":");
  expect(getTextarea()).toHaveFocus();
  expect(getPopover()).toBeVisible();
  expect(getOption("😄 smile")).toHaveFocus();
});

test("type", async () => {
  render(<Example />);
  await press.Tab();
  await type("Hello, @");
  expect(getTextarea()).toHaveValue("Hello, @");
  expect(getPopover()).toBeVisible();
  expect(getTextarea()).toHaveFocus();
  expect(getOption("diegohaz")).toHaveFocus();
  await type("l");
  expect(getPopover()).toBeVisible();
  expect(getTextarea()).toHaveFocus();
  expect(getOption("lluia")).toHaveFocus();
  await press.ArrowLeft();
  expect(getPopover()).not.toBeInTheDocument();
  await press.ArrowRight(null, { shiftKey: true });
  await type("\b");
  expect(getTextarea()).toHaveValue("Hello, @");
  expect(getPopover()).toBeVisible();
  expect(getTextarea()).toHaveFocus();
  expect(getOption("diegohaz")).not.toHaveFocus();
});
