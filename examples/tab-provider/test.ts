import { click, focus, getByRole, press } from "@ariakit/test";

function getTab(name: string) {
  return getByRole("tab", { name });
}

function getPanel(name: string) {
  return getByRole("tabpanel", { name });
}

test("default selected tab", () => {
  expect(getTab("Vegetables")).toHaveAttribute("aria-selected", "true");
  expect(getPanel("Vegetables")).toBeVisible();
});

test("select with keyboard", async () => {
  await press.Tab();
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
  await click(getTab("Meat"));
  expect(getTab("Meat")).toHaveAttribute("aria-selected", "true");
  expect(getTab("Meat")).toHaveFocus();
  expect(getPanel("Meat")).toBeVisible();
});

test("do not select with focus (e.g., screen reader focus)", async () => {
  await focus(getTab("Fruits"));
  expect(getTab("Vegetables")).toHaveAttribute("aria-selected", "true");
  expect(getTab("Fruits")).toHaveFocus();
  expect(getPanel("Vegetables")).toBeVisible();
});
