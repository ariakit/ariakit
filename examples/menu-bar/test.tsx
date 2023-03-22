import {
  click,
  getByRole,
  hover,
  press,
  queryByLabelText,
  render,
  sleep,
  type,
} from "@ariakit/test";
import Example from "./index.jsx";

const getMenu = (name: string) =>
  queryByLabelText(name, { selector: "[role='menu']" });
const getMenuItem = (name: string) => getByRole("menuitem", { name });

test("show/hide on click", async () => {
  render(<Example />);
  expect(getMenu("File")).not.toBeInTheDocument();
  await click(getMenuItem("File"));
  expect(getMenu("File")).toBeInTheDocument();
  expect(getMenu("File")).toBeVisible();
  expect(getMenu("File")).toHaveFocus();
  expect(getMenuItem("New Tab")).not.toHaveFocus();
  await click(getMenuItem("New Tab"));
  expect(getMenu("File")).not.toBeInTheDocument();
  expect(getMenuItem("File")).toHaveFocus();
  await click(getMenuItem("File"));
  await click(getMenuItem("File"));
  expect(getMenu("File")).not.toBeInTheDocument();
  expect(getMenuItem("File")).toHaveFocus();
});

test("show/hide on enter", async () => {
  render(<Example />);
  await press.Tab();
  await press.Enter();
  expect(getMenu("File")).toBeInTheDocument();
  expect(getMenu("File")).toBeVisible();
  expect(getMenuItem("New Tab")).toHaveFocus();
  await press.Enter();
  expect(getMenu("File")).not.toBeInTheDocument();
  expect(getMenuItem("File")).toHaveFocus();
  await press.Enter();
  await press.ShiftTab();
  expect(getMenu("File")).toBeInTheDocument();
  expect(getMenu("File")).toBeVisible();
  expect(getMenuItem("File")).toHaveFocus();
  await press.Enter();
  expect(getMenu("File")).not.toBeInTheDocument();
  expect(getMenuItem("File")).toHaveFocus();
});

test("show/hide on space", async () => {
  render(<Example />);
  await press.Tab();
  await press.Space();
  expect(getMenu("File")).toBeInTheDocument();
  expect(getMenu("File")).toBeVisible();
  expect(getMenuItem("New Tab")).toHaveFocus();
  await press.Space();
  expect(getMenu("File")).not.toBeInTheDocument();
  expect(getMenuItem("File")).toHaveFocus();
  await press.Space();
  await press.ShiftTab();
  expect(getMenu("File")).toBeInTheDocument();
  expect(getMenu("File")).toBeVisible();
  expect(getMenuItem("File")).toHaveFocus();
  await press.Space();
  expect(getMenu("File")).not.toBeInTheDocument();
  expect(getMenuItem("File")).toHaveFocus();
});

test("show/hide on key down", async () => {
  render(<Example />);
  await press.Tab();
  await press.ArrowDown();
  expect(getMenu("File")).toBeInTheDocument();
  expect(getMenu("File")).toBeVisible();
  expect(getMenuItem("New Tab")).toHaveFocus();
  await press.ArrowRight();
  expect(getMenu("File")).not.toBeInTheDocument();
  expect(getMenu("Edit")).toBeInTheDocument();
  expect(getMenu("Edit")).toBeVisible();
  expect(getMenuItem("Edit")).toHaveFocus();
  await press.ArrowUp();
  expect(getMenuItem("Emoji & Symbols")).toHaveFocus();
  await press.ArrowLeft();
  await press.ArrowRight();
  await press.ArrowUp();
  expect(getMenuItem("Emoji & Symbols")).toHaveFocus();
  await type("f");
  expect(getMenuItem("Find")).toHaveFocus();
  expect(getMenu("Find")).not.toBeInTheDocument();
  await press.ArrowRight();
  expect(getMenu("Find")).toBeInTheDocument();
  expect(getMenu("Find")).toBeVisible();
  expect(getMenuItem("Search the Web")).toHaveFocus();
  await press.ArrowLeft();
  expect(getMenuItem("Find")).toHaveFocus();
  expect(getMenu("Find")).not.toBeInTheDocument();
  await press.ArrowRight();
  await press.ArrowRight();
  expect(getMenuItem("View")).toHaveFocus();
  expect(getMenu("View")).toBeInTheDocument();
  expect(getMenu("View")).toBeVisible();
  await press.ArrowDown();
  expect(getMenuItem("Force Reload This Page")).toHaveFocus();
  await press.ArrowRight();
  expect(getMenuItem("File")).toHaveFocus();
  expect(getMenu("File")).toBeInTheDocument();
  expect(getMenu("File")).toBeVisible();
});

test("show/hide on hover", async () => {
  render(<Example />);
  await hover(getMenuItem("File"));
  expect(getMenu("File")).not.toBeInTheDocument();
  await click(getMenuItem("File"));
  expect(getMenu("File")).toBeInTheDocument();
  expect(getMenu("File")).toBeVisible();
  await hover(getMenuItem("New Window"));
  expect(getMenu("File")).toHaveFocus();
  await hover(getMenuItem("View"));
  expect(getMenuItem("View")).toHaveFocus();
  expect(getMenu("File")).not.toBeInTheDocument();
  expect(getMenu("View")).toBeInTheDocument();
  expect(getMenu("View")).toBeVisible();
});

test("hide on escape", async () => {
  render(<Example />);
  await press.Tab();
  await press.Enter();
  await type("sh");
  expect(getMenuItem("Share")).toHaveFocus();
  await sleep(600);
  await press.Space();
  expect(getMenuItem("Email Link")).toHaveFocus();
  await press.Escape();
  expect(getMenuItem("File")).toHaveFocus();
  expect(getMenu("Share")).not.toBeInTheDocument();
  expect(getMenu("File")).not.toBeInTheDocument();
  await press.ArrowRight();
  expect(getMenuItem("Edit")).toHaveFocus();
  expect(getMenu("Edit")).not.toBeInTheDocument();
});
