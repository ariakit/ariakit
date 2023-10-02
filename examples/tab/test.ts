import { click, focus, press, q } from "@ariakit/test";

test("default selected tab", () => {
  expect(q.tab("Vegetables")).toHaveAttribute("aria-selected", "true");
  expect(q.tabpanel("Vegetables")).toBeVisible();
});

test("select with keyboard", async () => {
  await press.Tab();
  await press.ArrowRight();
  expect(q.tab("Meat")).toHaveAttribute("aria-selected", "true");
  expect(q.tab("Meat")).toHaveFocus();
  expect(q.tabpanel("Meat")).toBeVisible();
  await press.ArrowRight();
  expect(q.tab("Fruits")).toHaveAttribute("aria-selected", "true");
  expect(q.tab("Fruits")).toHaveFocus();
  expect(q.tabpanel("Fruits")).toBeVisible();
  await press.ArrowLeft();
  expect(q.tab("Meat")).toHaveAttribute("aria-selected", "true");
  expect(q.tab("Meat")).toHaveFocus();
  expect(q.tabpanel("Meat")).toBeVisible();
});

test("select with mouse", async () => {
  await click(q.tab("Meat"));
  expect(q.tab("Meat")).toHaveAttribute("aria-selected", "true");
  expect(q.tab("Meat")).toHaveFocus();
  expect(q.tabpanel("Meat")).toBeVisible();
});

test("do not select with focus (e.g., screen reader focus)", async () => {
  await focus(q.tab("Fruits"));
  expect(q.tab("Vegetables")).toHaveAttribute("aria-selected", "true");
  expect(q.tab("Fruits")).toHaveFocus();
  expect(q.tabpanel("Vegetables")).toBeVisible();
});
