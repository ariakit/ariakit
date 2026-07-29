import { click, focus, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/issues/6868
test("tabs to a non-scrollable list with real focus", async () => {
  await click(q.combobox("Real focus fruit"));
  expect(q.combobox("Search Real focus fruit")).toHaveFocus();

  await press.Tab();
  expect(q.button("Review Real focus fruit options")).toHaveFocus();

  await press.Tab();
  const list = q.listbox.ensure("Real focus fruit");
  expect(list).toHaveFocus();
  expect(q.status("Real focus fruit base element")).toHaveTextContent(
    "combobox",
  );

  await press.ArrowDown();
  expect(q.within(list).option("Apple")).toHaveFocus();
  expect(q.status("Real focus fruit selected value")).toHaveTextContent(
    "Apple",
  );

  list.focus();
  await press.ArrowDown();
  expect(q.within(list).option("Banana")).toHaveFocus();
  expect(q.status("Real focus fruit selected value")).toHaveTextContent(
    "Banana",
  );

  list.focus();
  await press.ArrowUp();
  expect(q.within(list).option("Apple")).toHaveFocus();
  expect(q.status("Real focus fruit selected value")).toHaveTextContent(
    "Apple",
  );

  list.focus();
  await press.Home();
  expect(q.within(list).option("Apple")).toHaveFocus();

  list.focus();
  await press.End();
  expect(q.within(list).option("Orange")).toHaveFocus();

  list.focus();
  await press.PageUp();
  expect(q.within(list).option("Apple")).toHaveFocus();

  list.focus();
  await press.PageDown();
  expect(q.within(list).option("Orange")).toHaveFocus();
});

test("tabs to a non-scrollable list with virtual focus", async () => {
  await click(q.combobox("Virtual focus fruit"));
  const input = q.combobox("Search Virtual focus fruit");
  expect(input).toHaveFocus();

  await press.Tab();
  expect(q.button("Review Virtual focus fruit options")).toHaveFocus();

  await press.Tab();
  const list = q.listbox.ensure("Virtual focus fruit");
  expect(list).toHaveFocus();
  expect(q.status("Virtual focus fruit base element")).toHaveTextContent(
    "combobox",
  );

  const orange = q.within(list).option("Orange");

  await press.ArrowDown();
  expect(input).toHaveFocus();
  expect(orange).toHaveAttribute("data-focus-visible", "true");
  expect(q.status("Virtual focus fruit selected value")).toHaveTextContent(
    "Orange",
  );

  list.focus();
  const banana = q.within(list).option("Banana");

  await press.ArrowUp();
  expect(input).toHaveFocus();
  expect(banana).toHaveAttribute("data-focus-visible", "true");
  expect(q.status("Virtual focus fruit selected value")).toHaveTextContent(
    "Banana",
  );
});

test("moves spatially from a focused RTL grid", async () => {
  await click(q.combobox("Grid fruit"));
  const grid = q.grid("Grid fruit");
  await focus(q.gridcell("Top Center"));

  await focus(grid);
  await press.ArrowDown();
  expect(q.gridcell("Bottom Center")).toHaveFocus();

  await focus(grid);
  await press.ArrowUp();
  expect(q.gridcell("Top Center")).toHaveFocus();

  await focus(grid);
  await press.ArrowRight();
  expect(q.gridcell("Top Left")).toHaveFocus();

  await focus(q.gridcell("Top Center"));
  await focus(grid);
  await press.ArrowLeft();
  expect(q.gridcell("Top Right")).toHaveFocus();
});
