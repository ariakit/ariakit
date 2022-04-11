import {
  click,
  getByRole,
  hover,
  press,
  render,
  type,
} from "ariakit-test-utils";
import Example from ".";

const getMenuButton = () => getByRole("button", { name: "Add block" });
const getMenu = () => getByRole("dialog", { hidden: true });
const getCombobox = () => getByRole("combobox");
const getOption = (name: string) => getByRole("option", { name });

test("show/hide on click", async () => {
  render(<Example />);
  expect(getMenu()).not.toBeVisible();
  await click(getMenuButton());
  expect(getMenu()).toBeVisible();
  expect(getMenu()).not.toHaveFocus();
  expect(getCombobox()).toHaveFocus();
  expect(getOption("Paragraph")).not.toHaveFocus();
  await click(getMenuButton());
  expect(getMenu()).not.toBeVisible();
  expect(getMenuButton()).toHaveFocus();
});

test("show/hide on enter", async () => {
  render(<Example />);
  await press.Tab();
  expect(getMenu()).not.toBeVisible();
  await press.Enter();
  expect(getMenu()).toBeVisible();
  expect(getMenu()).not.toHaveFocus();
  expect(getCombobox()).toHaveFocus();
  expect(getOption("Paragraph")).toHaveFocus();
  await press.ShiftTab();
  expect(getMenuButton()).toHaveFocus();
  await press.Enter();
  expect(getMenu()).not.toBeVisible();
  expect(getMenuButton()).toHaveFocus();
});

test("show/hide on space", async () => {
  render(<Example />);
  await press.Tab();
  await press.Space();
  expect(getMenu()).toBeVisible();
  expect(getMenu()).not.toHaveFocus();
  expect(getCombobox()).toHaveFocus();
  expect(getOption("Paragraph")).toHaveFocus();
  await press.ShiftTab();
  expect(getMenuButton()).toHaveFocus();
  await press.Space();
  expect(getMenu()).not.toBeVisible();
  expect(getMenuButton()).toHaveFocus();
});

test("show on arrow down", async () => {
  render(<Example />);
  await press.Tab();
  await press.ArrowDown();
  expect(getMenu()).toBeVisible();
  expect(getMenu()).not.toHaveFocus();
  expect(getCombobox()).toHaveFocus();
  expect(getOption("Paragraph")).toHaveFocus();
});

test("show on arrow up", async () => {
  render(<Example />);
  await press.Tab();
  await press.ArrowUp();
  expect(getMenu()).toBeVisible();
  expect(getMenu()).not.toHaveFocus();
  expect(getCombobox()).toHaveFocus();
  expect(getOption("Tag Cloud")).toHaveFocus();
});

test("type on combobox", async () => {
  render(<Example />);
  await click(getMenuButton());
  await type("c");
  expect(getOption("Classic")).toHaveFocus();
  await type("o");
  expect(() => getOption("Classic")).toThrow();
  expect(getOption("Code")).toHaveFocus();
  await type("ver");
  expect(getCombobox()).toHaveValue("cover");
  expect(() => getOption("Code")).toThrow();
  expect(getOption("Cover")).toHaveFocus();
  await press.Escape();
  expect(getMenuButton()).toHaveFocus();
  await click(getMenuButton());
  expect(getCombobox()).toHaveValue("");
});

test("backspace on combobox", async () => {
  render(<Example />);
  await press.Tab();
  await press.Enter();
  expect(getOption("Paragraph")).toHaveFocus();
  await type("g");
  expect(getOption("Gallery")).toHaveFocus();
  await type("r");
  expect(getOption("Group")).toHaveFocus();
  await type("\b");
  expect(getCombobox()).toHaveValue("g");
  expect(getOption("Gallery")).not.toHaveFocus();
  expect(getOption("Group")).not.toHaveFocus();
  await type("\b");
  expect(getCombobox()).toHaveValue("");
  expect(getOption("Paragraph")).not.toHaveFocus();
  expect(getOption("Gallery")).not.toHaveFocus();
  expect(getOption("Group")).not.toHaveFocus();
});

test("move through items with keyboard", async () => {
  render(<Example />);
  await press.Tab();
  await press.ArrowDown();
  expect(getOption("Paragraph")).toHaveFocus();
  await press.ArrowDown();
  expect(getOption("Heading")).toHaveFocus();
  await press.ArrowDown();
  expect(getOption("List")).toHaveFocus();
  await type("se");
  expect(getOption("Separator")).toHaveFocus();
  await press.ArrowDown();
  expect(getOption("Search")).toHaveFocus();
  await press.ArrowDown();
  expect(getOption("Verse")).toHaveFocus();
});

test("move through items with mouse and keyboard", async () => {
  render(<Example />);
  await click(getMenuButton());
  await press.ArrowDown();
  expect(getOption("Paragraph")).toHaveFocus();
  expect(getOption("Paragraph")).toHaveAttribute("data-focus-visible");
  await hover(getOption("List"));
  expect(getCombobox()).toHaveFocus();
  expect(getOption("List")).toHaveFocus();
  expect(getOption("List")).not.toHaveAttribute("data-focus-visible");
  await hover(getOption("Classic"));
  expect(getCombobox()).toHaveFocus();
  expect(getOption("Classic")).toHaveFocus();
  expect(getOption("Classic")).not.toHaveAttribute("data-focus-visible");
  await press.ArrowUp();
  expect(getCombobox()).toHaveFocus();
  expect(getOption("Quote")).toHaveFocus();
  expect(getOption("Quote")).toHaveAttribute("data-focus-visible");
});
