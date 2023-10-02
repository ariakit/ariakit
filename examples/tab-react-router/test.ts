import { click, press, q } from "@ariakit/test";

test("default selected tab", () => {
  expect(q.tab("Fruits")).toHaveAttribute("aria-selected", "true");
  expect(q.tabpanel("Fruits")).toBeVisible();
});

test("select with keyboard", async () => {
  await press.Tab();
  await press.ArrowRight();
  expect(q.tab("Fruits")).toHaveAttribute("aria-selected", "true");
  expect(q.tabpanel("Fruits")).toBeVisible();
  expect(q.tab("Vegetables")).toHaveFocus();
  expect(q.tab("Vegetables")).toHaveAttribute("aria-selected", "false");
  await press.Enter();
  expect(q.tab("Vegetables")).toHaveAttribute("aria-selected", "true");
  expect(q.tabpanel("Vegetables")).toBeVisible();
  await press.ArrowRight();
  expect(q.tab("Vegetables")).toHaveAttribute("aria-selected", "true");
  expect(q.tabpanel("Vegetables")).toBeVisible();
  expect(q.tab("Meat")).toHaveFocus();
  expect(q.tab("Meat")).toHaveAttribute("aria-selected", "false");
  await press.Space();
  expect(q.tab("Meat")).toHaveAttribute("aria-selected", "true");
  expect(q.tabpanel("Meat")).toBeVisible();
  await press.ArrowRight();
  expect(q.tab("Meat")).toHaveAttribute("aria-selected", "true");
  expect(q.tabpanel("Meat")).toBeVisible();
  expect(q.tab("Fruits")).toHaveFocus();
  expect(q.tab("Fruits")).toHaveAttribute("aria-selected", "false");
  await press.Enter();
  expect(q.tab("Fruits")).toHaveAttribute("aria-selected", "true");
  expect(q.tabpanel("Fruits")).toBeVisible();
  await press.ArrowLeft();
  await press.Space();
  expect(q.tab("Meat")).toHaveAttribute("aria-selected", "true");
  expect(q.tab("Meat")).toHaveFocus();
  expect(q.tabpanel("Meat")).toBeVisible();
});

test("select with mouse", async () => {
  await click(q.tab("Vegetables"));
  expect(q.tab("Vegetables")).toHaveAttribute("aria-selected", "true");
  expect(q.tab("Vegetables")).toHaveFocus();
  expect(q.tabpanel("Vegetables")).toBeVisible();
});
