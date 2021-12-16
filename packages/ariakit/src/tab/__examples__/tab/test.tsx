import { click, focus, getByRole, press, render } from "ariakit-test-utils";
import { axe } from "jest-axe";
import Example from ".";

function getTab(name: string) {
  return getByRole("tab", { name });
}

function getPanel(name: string) {
  return getByRole("tabpanel", { name });
}

test("a11y", async () => {
  const { container } = render(<Example />);
  expect(await axe(container)).toHaveNoViolations();
});

test("default selected tab", () => {
  render(<Example />);
  expect(getTab("Fruits")).toHaveAttribute("aria-selected", "true");
  expect(getPanel("Fruits")).toBeVisible();
});

test("select with keyboard", async () => {
  render(<Example />);
  await press.Tab();
  await press.ArrowRight();
  expect(getTab("Vegetables")).toHaveAttribute("aria-selected", "true");
  expect(getTab("Vegetables")).toHaveFocus();
  expect(getPanel("Vegetables")).toBeVisible();
  await press.ArrowRight();
  expect(getTab("Meat")).toHaveAttribute("aria-selected", "true");
  expect(getTab("Meat")).toHaveFocus();
  expect(getPanel("Meat")).toBeVisible();
  await press.ArrowRight();
  expect(getTab("Fruits")).toHaveAttribute("aria-selected", "true");
  expect(getTab("Fruits")).toHaveFocus();
  expect(getPanel("Fruits")).toBeVisible();
  await press.ArrowLeft();
  expect(getTab("Meat")).toHaveAttribute("aria-selected", "true");
  expect(getTab("Meat")).toHaveFocus();
  expect(getPanel("Meat")).toBeVisible();
});

test("select with mouse", async () => {
  render(<Example />);
  await click(getTab("Vegetables"));
  expect(getTab("Vegetables")).toHaveAttribute("aria-selected", "true");
  expect(getTab("Vegetables")).toHaveFocus();
  expect(getPanel("Vegetables")).toBeVisible();
});

test("do not select with focus (e.g., screen reader focus)", async () => {
  render(<Example />);
  await focus(getTab("Vegetables"));
  expect(getTab("Fruits")).toHaveAttribute("aria-selected", "true");
  expect(getTab("Vegetables")).toHaveFocus();
  expect(getPanel("Fruits")).toBeVisible();
});
