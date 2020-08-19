import * as React from "react";
import { render, press, click, hover, wait, axe } from "reakit-test-utils";
import SimpleMenu from "..";

test("open menu with click", async () => {
  const { getByText: text, getByLabelText: label } = render(<SimpleMenu />);
  expect(label("Preferences")).not.toBeVisible();
  click(text("Preferences"));
  expect(label("Preferences")).toBeVisible();
  expect(label("Preferences")).toHaveFocus();
});

test("open menu with enter", async () => {
  const { getByText: text, getByLabelText: label } = render(<SimpleMenu />);
  expect(label("Preferences")).not.toBeVisible();
  press.Tab();
  press.Enter();
  expect(label("Preferences")).toBeVisible();
  await wait(expect(text("Settings")).toHaveFocus);
});

test("open menu with space", async () => {
  const { getByText: text, getByLabelText: label } = render(<SimpleMenu />);
  expect(label("Preferences")).not.toBeVisible();
  press.Tab();
  press.Space();
  expect(label("Preferences")).toBeVisible();
  await wait(expect(text("Settings")).toHaveFocus);
});

test("open menu with arrow down", async () => {
  const { getByText: text, getByLabelText: label } = render(<SimpleMenu />);
  expect(label("Preferences")).not.toBeVisible();
  press.Tab();
  press.ArrowDown();
  expect(label("Preferences")).toBeVisible();
  await wait(expect(text("Settings")).toHaveFocus);
});

test("open menu with arrow up", async () => {
  const { getByText: text, getByLabelText: label } = render(<SimpleMenu />);
  expect(label("Preferences")).not.toBeVisible();
  press.Tab();
  press.ArrowUp();
  expect(label("Preferences")).toBeVisible();
  await wait(expect(text("Keyboard shortcuts")).toHaveFocus);
});

test("navigate through menu items using arrow keys", async () => {
  const { getByText: text } = render(<SimpleMenu />);
  click(text("Preferences"));
  press.ArrowDown();
  expect(text("Settings")).toHaveFocus();
  press.ArrowDown();
  expect(text("Extensions")).toHaveFocus();
  press.ArrowRight();
  expect(text("Extensions")).toHaveFocus();
  press.ArrowLeft();
  expect(text("Extensions")).toHaveFocus();
  press.ArrowDown();
  expect(text("Keyboard shortcuts")).toHaveFocus();
  press.PageUp();
  expect(text("Settings")).toHaveFocus();
  press.PageDown();
  expect(text("Keyboard shortcuts")).toHaveFocus();
  press.Home();
  expect(text("Settings")).toHaveFocus();
  press.End();
  expect(text("Keyboard shortcuts")).toHaveFocus();
});

test("hovering menu item moves focus into it", async () => {
  const { getByText: text, getByLabelText: label } = render(<SimpleMenu />);
  click(text("Preferences"));
  hover(text("Extensions"));
  expect(text("Extensions")).toHaveFocus();
  hover(label("Preferences"));
  expect(text("Extensions")).not.toHaveFocus();
  expect(label("Preferences")).toHaveFocus();
});

test("close menu by pressing esc on menu", async () => {
  const { getByText: text, getByLabelText: label } = render(<SimpleMenu />);
  click(text("Preferences"));
  expect(label("Preferences")).toHaveFocus();
  press.Escape();
  expect(label("Preferences")).not.toBeVisible();
  expect(text("Preferences")).toHaveFocus();
});

test("close menu by pressing esc on menu button", async () => {
  const { getByText: text, getByLabelText: label } = render(<SimpleMenu />);
  click(text("Preferences"));
  expect(label("Preferences")).toHaveFocus();
  press.ShiftTab();
  expect(text("Preferences")).toHaveFocus();
  press.Escape();
  expect(label("Preferences")).not.toBeVisible();
  expect(text("Preferences")).toHaveFocus();
});

test("close menu by pressing esc on menu item", async () => {
  const { getByText: text, getByLabelText: label } = render(<SimpleMenu />);
  press.Tab();
  press.Enter();
  await wait(expect(text("Settings")).toHaveFocus);
  press.Escape();
  expect(label("Preferences")).not.toBeVisible();
  expect(text("Preferences")).toHaveFocus();
});

test("close menu by clicking on menu button", async () => {
  const { getByText: text, getByLabelText: label } = render(<SimpleMenu />);
  expect(label("Preferences")).not.toBeVisible();
  click(text("Preferences"));
  expect(label("Preferences")).toBeVisible();
  expect(label("Preferences")).toHaveFocus();
  click(text("Preferences"));
  expect(label("Preferences")).not.toBeVisible();
  expect(text("Preferences")).toHaveFocus();
});

test("close menu by clicking outside menu", async () => {
  const { getByText: text, getByLabelText: label, baseElement } = render(
    <SimpleMenu />
  );
  expect(label("Preferences")).not.toBeVisible();
  click(text("Preferences"));
  expect(label("Preferences")).toBeVisible();
  expect(label("Preferences")).toHaveFocus();
  click(baseElement);
  expect(label("Preferences")).not.toBeVisible();
  expect(text("Preferences")).toHaveFocus();
});

test("renders with no a11y violations", async () => {
  const { baseElement } = render(<SimpleMenu />);
  const results = await axe(baseElement);

  expect(results).toHaveNoViolations();
});
