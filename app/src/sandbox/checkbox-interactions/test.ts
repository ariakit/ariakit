import { click, focus, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("renders native checkbox semantics and supports Tab and Space", async () => {
  const terms = q.checkbox("Terms");
  expect(terms).toHaveAttribute("type", "checkbox");
  expect(terms).toHaveAttribute("aria-checked", "false");

  await press.Tab();
  expect(terms).toHaveFocus();

  await press.Space();
  expect(terms).toBeChecked();
  await press.Space();
  expect(terms).not.toBeChecked();
});

test("keeps each checkbox implementation in the tab order", async () => {
  const names = [
    "Terms",
    "Controlled",
    "Store",
    "Valued",
    "Dynamic 1",
    "Dynamic 2",
    "Button checkbox: Unchecked",
    "Forwarded undefined",
    "Custom",
    "Apple",
    "Orange",
    "Mango",
  ];

  for (const name of names) {
    await press.Tab();
    expect(q.checkbox(name)).toHaveFocus();
  }
});

test("supports uncontrolled, controlled, store, and valued checkboxes", async () => {
  const terms = q.checkbox("Terms");
  const controlled = q.checkbox("Controlled");
  const store = q.checkbox("Store");
  const valued = q.checkbox("Valued");

  expect(terms).not.toBeChecked();
  await click(q.text("Terms"));
  expect(terms).toBeChecked();

  expect(controlled).toBeChecked();
  await click(controlled);
  expect(controlled).not.toBeChecked();

  expect(store).toBeChecked();
  await click(q.text("Store"));
  expect(store).not.toBeChecked();
  await focus(store);
  await press.Space();
  expect(store).toBeChecked();
  await press.Space();
  expect(store).not.toBeChecked();

  expect(valued).toHaveAttribute("value", "accept");
  await click(q.text("Valued"));
  expect(valued).toBeChecked();
  await focus(valued);
  await press.Space();
  expect(valued).not.toBeChecked();
  await press.Space();
  expect(valued).toBeChecked();
});

test("updates dynamically linked checkbox stores", async () => {
  const first = q.checkbox("Dynamic 1");
  const second = q.checkbox("Dynamic 2");

  expect(first).toBeChecked();
  expect(second).toBeChecked();

  await click(first);
  expect(first).not.toBeChecked();
  expect(second).not.toBeChecked();

  await click(first);
  expect(first).toBeChecked();
  expect(second).toBeChecked();

  await click(second);
  expect(first).not.toBeChecked();
  expect(second).not.toBeChecked();

  await click(second);
  expect(first).not.toBeChecked();
  expect(second).toBeChecked();
});

test("supports a checkbox rendered as a button", async () => {
  const unchecked = q.checkbox("Button checkbox: Unchecked");
  expect(unchecked).toHaveRole("checkbox");
  expect(unchecked).toHaveAttribute("aria-checked", "false");

  await click(unchecked);
  const checked = q.checkbox("Button checkbox: Checked");
  expect(checked).toHaveAttribute("aria-checked", "true");

  await click(checked);
  expect(q.checkbox("Button checkbox: Unchecked")).toHaveAttribute(
    "aria-checked",
    "false",
  );

  await click(unchecked);
  expect(q.checkbox("Button checkbox: Checked")).toHaveAttribute(
    "aria-checked",
    "true",
  );

  await focus(checked);
  await press.Space();
  expect(q.checkbox("Button checkbox: Unchecked")).toHaveAttribute(
    "aria-checked",
    "false",
  );

  await press.Space();
  expect(q.checkbox("Button checkbox: Checked")).toHaveAttribute(
    "aria-checked",
    "true",
  );

  await press.Enter();
  expect(q.checkbox("Button checkbox: Unchecked")).toHaveAttribute(
    "aria-checked",
    "false",
  );

  await press.Enter();
  expect(q.checkbox("Button checkbox: Checked")).toHaveAttribute(
    "aria-checked",
    "true",
  );
});

// https://github.com/ariakit/ariakit/issues/7036
test("preserves checkbox semantics when an optional render prop is undefined", async () => {
  const checkbox = q.checkbox("Forwarded undefined");
  expect(checkbox).toHaveAttribute("aria-checked", "false");

  await click(checkbox);
  expect(q.checkbox("Forwarded undefined")).toHaveAttribute(
    "aria-checked",
    "true",
  );
});

test("supports a custom visually hidden checkbox", async () => {
  const checkbox = q.checkbox("Custom");
  expect(checkbox).toBeChecked();

  await click(q.text("Custom"));
  expect(checkbox).not.toBeChecked();

  await click(q.text("Custom"));
  expect(checkbox).toBeChecked();

  await focus(checkbox);
  await press.Space();
  expect(checkbox).not.toBeChecked();

  await press.Space();
  expect(checkbox).toBeChecked();

  await press.Enter();
  expect(checkbox).not.toBeChecked();

  await press.Enter();
  expect(checkbox).toBeChecked();
});

test("updates independent values in a checkbox group", async () => {
  const group = q.group("Favorite fruits");
  const apple = q.checkbox("Apple");
  const orange = q.checkbox("Orange");
  const mango = q.checkbox("Mango");

  expect(group).toHaveAttribute("role", "group");
  expect(apple).not.toBeChecked();
  expect(orange).not.toBeChecked();
  expect(mango).not.toBeChecked();

  await click(apple);
  expect(apple).toBeChecked();
  expect(orange).not.toBeChecked();
  expect(mango).not.toBeChecked();

  await click(apple);
  await click(mango);
  expect(apple).not.toBeChecked();
  expect(orange).not.toBeChecked();
  expect(mango).toBeChecked();

  await focus(apple);
  await press.Space();
  expect(apple).toBeChecked();

  await focus(orange);
  await press.Space();
  expect(apple).toBeChecked();
  expect(orange).toBeChecked();
  expect(mango).toBeChecked();
});
