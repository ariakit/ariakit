import { click, focus, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/issues/6868
test("skips a non-scrollable list with real focus", async () => {
  await click(q.combobox("Real focus fruit"));
  expect(q.combobox("Search Real focus fruit")).toHaveFocus();
  const list = q.listbox.ensure("Real focus fruit");
  expect(list).toHaveAttribute("tabindex", "-1");

  await press.Tab();
  expect(q.button("Review Real focus fruit options")).toHaveFocus();

  await press.Tab();
  expect(q.button("After Real focus fruit options")).toHaveFocus();
  expect(q.status("Real focus fruit base element")).toHaveTextContent(
    "combobox",
  );

  await focus(list);
  await press.ArrowDown();
  expect(q.within(list).option("Apple")).toHaveFocus();
  expect(q.status("Real focus fruit selected value")).toHaveTextContent(
    "Apple",
  );

  await focus(list);
  await press.ArrowDown();
  expect(q.within(list).option("Banana")).toHaveFocus();
  expect(q.status("Real focus fruit selected value")).toHaveTextContent(
    "Banana",
  );

  await focus(list);
  await press.ArrowUp();
  expect(q.within(list).option("Apple")).toHaveFocus();
  expect(q.status("Real focus fruit selected value")).toHaveTextContent(
    "Apple",
  );

  await focus(list);
  await press.Home();
  expect(q.within(list).option("Apple")).toHaveFocus();

  await focus(list);
  await press.End();
  expect(q.within(list).option("Orange")).toHaveFocus();

  await focus(list);
  await press.PageUp();
  expect(q.within(list).option("Apple")).toHaveFocus();

  await focus(list);
  await press.PageDown();
  expect(q.within(list).option("Orange")).toHaveFocus();
});

test("tabs to a non-scrollable list with virtual focus", async () => {
  await click(q.combobox("Virtual focus fruit"));
  const input = q.combobox("Search Virtual focus fruit");
  expect(input).toHaveFocus();
  const list = q.listbox.ensure("Virtual focus fruit");
  expect(list).toHaveAttribute("tabindex", "-1");

  await press.Tab();
  expect(q.button("Review Virtual focus fruit options")).toHaveFocus();
  expect(list).toHaveAttribute("tabindex", "0");

  await press.Tab();
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

  await focus(list);
  const banana = q.within(list).option("Banana");

  await press.ArrowUp();
  expect(input).toHaveFocus();
  expect(banana).toHaveAttribute("data-focus-visible", "true");
  expect(q.status("Virtual focus fruit selected value")).toHaveTextContent(
    "Banana",
  );

  await focus(q.button("After Virtual focus fruit options"));
  await focus(q.button("After selects"));
  expect(list).toHaveAttribute("tabindex", "-1");
});

test("keeps the list unfocusable when focusable is false", async () => {
  await click(q.combobox("Unfocusable list fruit"));
  expect(q.combobox("Search Unfocusable list fruit")).toHaveFocus();
  const list = q.listbox.ensure("Unfocusable list fruit");
  expect(list).not.toHaveAttribute("tabindex");

  await press.Tab();
  expect(q.button("Review Unfocusable list fruit options")).toHaveFocus();

  await press.Tab();
  expect(q.button("After Unfocusable list fruit options")).toHaveFocus();
});

test("keeps the list out of the tab order after leaving an external base", async () => {
  const select = q.combobox("External base fruit");
  await click(select);
  const list = q.listbox.ensure("External base fruit options");
  const banana = q.within(list).option.ensure("Banana");
  expect(select).toHaveFocus();
  expect(select).toHaveAttribute("aria-activedescendant", banana.id);
  expect(list).toHaveAttribute("tabindex", "-1");

  await focus(q.button("After external base fruit"));
  expect(list).toHaveAttribute("tabindex", "-1");
});

test("moves spatially from a focused RTL grid", async () => {
  await click(q.combobox("Grid fruit"));
  const grid = q.grid("Grid fruit");

  await focus(grid);
  await press.ArrowUp();
  expect(q.gridcell("Bottom Left")).toHaveFocus();

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
