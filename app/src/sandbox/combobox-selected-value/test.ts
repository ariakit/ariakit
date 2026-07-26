import { click, focus, press, q, type } from "@ariakit/test";
import { expect, test } from "vitest";

test("renders fallback, selected value, and item state", async () => {
  expect(q.combobox("Favorite fruit")).toHaveTextContent("Apple");
  expect(q.status("Rendered favorite fruit")).toHaveTextContent(
    "Rendered fruit: Apple",
  );

  await click(q.combobox("Favorite fruit"));

  expect(q.option("Apple")).toHaveTextContent("✓");
  expect(q.option("Banana")).not.toHaveTextContent("✓");
  expect(
    q.option.ensure("Apple").querySelector("[data-selected]"),
  ).toBeInTheDocument();

  await click(q.option("Banana"));

  expect(q.combobox("Favorite fruit")).toHaveTextContent("Banana");
  expect(q.status("Rendered favorite fruit")).toHaveTextContent(
    "Rendered fruit: Banana",
  );

  await click(q.combobox("Favorite fruit"));
  await click(q.option("Clear selection"));

  expect(q.combobox("Favorite fruit")).toHaveTextContent("No fruit");
  expect(q.status("Rendered favorite fruit")).toHaveTextContent(
    "Rendered fruit: No fruit",
  );
});

test("heading labels the popover and nested list", async () => {
  await click(q.combobox("Favorite fruit"));

  expect(q.dialog("Fruit options")).toBeVisible();
  expect(q.listbox("Fruit options")).toBeVisible();

  await click(q.button("Dismiss fruit options"));

  expect(q.dialog("Fruit options")).not.toBeInTheDocument();
});

test("restores the selected value on Escape", async () => {
  await click(q.combobox("Preview fruit"));
  await press.ArrowDown();

  expect(q.combobox("Preview fruit")).toHaveTextContent("Banana");

  await press.Escape();

  expect(q.combobox("Preview fruit")).toHaveTextContent("Apple");
});

// https://github.com/ariakit/ariakit/pull/6832#discussion_r3647555720
test("keeps a disabled filterable select out of the tab order", async () => {
  const select = q.combobox("Disabled fruit");
  expect(select).toBeDisabled();

  await focus(q.textbox("Before disabled select"));
  await press.Tab();

  expect(q.textbox("After disabled select")).toHaveFocus();
});

// https://github.com/ariakit/ariakit/pull/6832#discussion_r3647555511
test("preserves the input value when resetValueOnSelect is false", async () => {
  const input = q.combobox.ensure("Persistent fruit filter");
  await type("ap", input);
  await click(q.option("Apple"));

  expect(input).toHaveValue("ap");
});

// https://github.com/ariakit/ariakit/pull/6832
test("preserves a select input value when resetValueOnSelect is false", async () => {
  await click(q.combobox("Persistent select fruit"));
  const input = q.combobox.ensure("Persistent select fruit filter");
  await type("ap", input);
  await click(q.option("Apple"));

  expect(input).toHaveValue("ap");
});

// https://github.com/ariakit/ariakit/pull/6832#discussion_r3649285821
test("keeps the selected value on Escape without a select", async () => {
  await click(q.combobox("Plain fruit filter"));
  await click(q.option("Banana"));

  expect(q.status("Plain fruit selection")).toHaveTextContent("Banana");

  await press.Escape();

  expect(q.status("Plain fruit selection")).toHaveTextContent("Banana");
});

// https://github.com/ariakit/ariakit/pull/6832#discussion_r3647556185
test("preserves aria-selected on menu-role multi-select items", async () => {
  await click(q.combobox("Menu fruit filter"));

  expect(q.menuitem("Apple")).toHaveAttribute("aria-selected", "true");
});
