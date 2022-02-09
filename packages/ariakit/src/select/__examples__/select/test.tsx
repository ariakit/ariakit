import {
  click,
  getByRole,
  getByText,
  hover,
  press,
  render,
  sleep,
} from "ariakit-test-utils";
import Example from ".";

const getLabel = () => getByText("Favorite fruit");
const getSelect = () => getByRole("combobox", { name: "Favorite fruit" });
const getList = () => getByRole("listbox", { hidden: true });
const getOption = (name: string) => getByRole("option", { name });

test("default value", () => {
  render(<Example />);
  expect(getSelect()).toHaveTextContent("Apple");
});

test("click on label", async () => {
  render(<Example />);
  expect(getSelect()).not.toHaveFocus();
  await click(getLabel());
  expect(getSelect()).toHaveFocus();
  expect(getSelect()).toHaveAttribute("data-focus-visible");
  expect(getList()).not.toBeVisible();
});

test("show/hide on click", async () => {
  render(<Example />);
  expect(getList()).not.toBeVisible();
  await click(getSelect());
  expect(getList()).toBeVisible();
  expect(getList()).toHaveFocus();
  expect(getOption("Apple")).toHaveFocus();
  expect(getOption("Apple")).toHaveAttribute("aria-selected", "true");
  expect(getSelect()).toHaveTextContent("Apple");
  await click(getSelect());
  expect(getList()).not.toBeVisible();
  expect(getSelect()).toHaveFocus();
  expect(getSelect()).toHaveTextContent("Apple");
});

test("show/hide on enter", async () => {
  render(<Example />);
  await press.Tab();
  await press.Enter();
  expect(getList()).toBeVisible();
  expect(getList()).toHaveFocus();
  expect(getOption("Apple")).toHaveFocus();
  expect(getSelect()).toHaveTextContent("Apple");
  await press.ShiftTab();
  await press.Enter();
  expect(getList()).not.toBeVisible();
  expect(getSelect()).toHaveTextContent("Apple");
});

test("show/hide on space", async () => {
  render(<Example />);
  await press.Tab();
  await press.Space();
  expect(getList()).toBeVisible();
  expect(getList()).toHaveFocus();
  expect(getOption("Apple")).toHaveFocus();
  expect(getSelect()).toHaveTextContent("Apple");
  await press.ShiftTab();
  await press.Space();
  expect(getList()).not.toBeVisible();
  expect(getSelect()).toHaveTextContent("Apple");
});

test("show on arrow keys", async () => {
  render(<Example />);
  await press.Tab();
  await press.ArrowDown();
  expect(getList()).toBeVisible();
  expect(getList()).toHaveFocus();
  expect(getOption("Apple")).toHaveFocus();
  await press.ShiftTab();
  expect(getSelect()).toHaveFocus();
  expect(getOption("Apple")).not.toHaveFocus();
  await press.ArrowUp();
  expect(getList()).toBeVisible();
  expect(getList()).toHaveFocus();
  expect(getOption("Apple")).toHaveFocus();
});

test("hide on escape", async () => {
  render(<Example />);
  await click(getSelect());
  expect(getList()).toBeVisible();
  await press.Escape();
  expect(getList()).not.toBeVisible();
});

test("hide on click outside", async () => {
  const { baseElement } = render(<Example />);
  await click(getSelect());
  expect(getList()).toBeVisible();
  await click(baseElement);
  expect(getList()).not.toBeVisible();
});

test("hide on click on label", async () => {
  render(<Example />);
  await click(getSelect());
  expect(getList()).toBeVisible();
  await click(getLabel());
  expect(getSelect()).toHaveFocus();
  expect(getList()).not.toBeVisible();
});

test("navigate through items with keyboard", async () => {
  render(<Example />);
  await press.Tab();
  await press.ArrowDown();
  expect(getOption("Apple")).toHaveFocus();
  expect(getOption("Apple")).toHaveAttribute("aria-selected", "true");
  await press.ArrowDown();
  expect(getOption("Banana")).toHaveFocus();
  expect(getOption("Apple")).toHaveAttribute("aria-selected", "true");
  expect(getOption("Banana")).toHaveAttribute("aria-selected", "false");
  await press.ArrowDown();
  expect(getOption("Orange")).toHaveFocus();
  expect(getOption("Apple")).toHaveAttribute("aria-selected", "true");
  expect(getOption("Orange")).toHaveAttribute("aria-selected", "false");
  await press.ArrowUp();
  expect(getOption("Banana")).toHaveFocus();
  await press.ArrowRight();
  expect(getOption("Banana")).toHaveFocus();
  await press.ArrowLeft();
  expect(getOption("Banana")).toHaveFocus();
  await press.End();
  expect(getOption("Orange")).toHaveFocus();
  await press.ArrowDown();
  expect(getOption("Orange")).toHaveFocus();
  await press.Home();
  expect(getOption("Apple")).toHaveFocus();
  await press.ArrowUp();
  expect(getOption("Apple")).toHaveFocus();
});

test("typeahead visible", async () => {
  render(<Example />);
  await press.Tab();
  await press.Enter();
  await press("b");
  expect(getOption("Banana")).toHaveFocus();
  expect(getOption("Apple")).toHaveAttribute("aria-selected", "true");
  expect(getOption("Banana")).toHaveAttribute("aria-selected", "false");
  await sleep(600);
  await press("o");
  await press("r");
  await press("a");
  expect(getOption("Orange")).toHaveFocus();
  expect(getOption("Apple")).toHaveAttribute("aria-selected", "true");
  expect(getOption("Orange")).toHaveAttribute("aria-selected", "false");
});

test("typeahead hidden", async () => {
  render(<Example />);
  await press.Tab();
  await press("g");
  expect(getSelect()).toHaveTextContent("Apple");
  expect(getList()).not.toBeVisible();
  await sleep(600);
  await press("o");
  await press("r");
  await press("a");
  expect(getSelect()).toHaveTextContent("Orange");
  expect(getList()).not.toBeVisible();
});

test("select with enter", async () => {
  render(<Example />);
  await press.Tab();
  await press.Enter();
  await press.ArrowDown();
  await press.Enter();
  expect(getSelect()).toHaveTextContent("Banana");
  expect(getList()).not.toBeVisible();
  await press.Enter();
  expect(getList()).toBeVisible();
  expect(getOption("Banana")).toHaveFocus();
  expect(getOption("Apple")).toHaveAttribute("aria-selected", "false");
  expect(getOption("Banana")).toHaveAttribute("aria-selected", "true");
});

test("select with space", async () => {
  render(<Example />);
  await press.Tab();
  await press.Space();
  await press.ArrowDown();
  await press.ArrowDown();
  await press.Space();
  expect(getSelect()).toHaveTextContent("Orange");
  expect(getList()).not.toBeVisible();
  await press.Space();
  expect(getList()).toBeVisible();
  expect(getOption("Orange")).toHaveFocus();
  expect(getOption("Apple")).toHaveAttribute("aria-selected", "false");
  expect(getOption("Orange")).toHaveAttribute("aria-selected", "true");
});

test("select with click", async () => {
  render(<Example />);
  await click(getSelect());
  await click(getOption("Banana"));
  expect(getSelect()).toHaveTextContent("Banana");
  expect(getList()).not.toBeVisible();
  await click(getSelect());
  expect(getOption("Apple")).toHaveAttribute("aria-selected", "false");
  expect(getOption("Banana")).toHaveAttribute("aria-selected", "true");
  await click(getOption("Grape"));
  expect(getSelect()).toHaveTextContent("Banana");
  expect(getList()).toBeVisible();
  await click(getOption("Orange"));
  expect(getSelect()).toHaveTextContent("Orange");
  expect(getList()).not.toBeVisible();
});

test("hover on item", async () => {
  render(<Example />);
  await click(getSelect());
  await hover(getOption("Banana"));
  expect(getOption("Banana")).toHaveFocus();
  expect(getSelect()).toHaveTextContent("Apple");
  expect(getOption("Apple")).toHaveAttribute("aria-selected", "true");
  expect(getOption("Banana")).toHaveAttribute("aria-selected", "false");
  await hover(getOption("Grape"));
  expect(getOption("Banana")).not.toHaveFocus();
  expect(getList()).toHaveFocus();
  expect(getSelect()).toHaveTextContent("Apple");
  expect(getOption("Apple")).toHaveAttribute("aria-selected", "true");
});
