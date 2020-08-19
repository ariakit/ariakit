import * as React from "react";
import { render, hover, click, wait, press, axe } from "reakit-test-utils";
import ChromeMenuBar from "..";

test("open and hover menus", async () => {
  const { getByText: text, getByLabelText: label } = render(<ChromeMenuBar />);
  expect(label("File")).not.toBeVisible();
  click(text("File"));
  await wait(expect(label("File")).toBeVisible);
  expect(text("File")).toHaveFocus();
  hover(text("Edit"));
  await wait(expect(label("Edit")).toBeVisible);
  expect(text("Edit")).toHaveFocus();
});

test("navigate through the menu bar using keyboard", async () => {
  const { getByText: text, getByLabelText: label } = render(<ChromeMenuBar />);
  expect(text("Chrome")).not.toHaveFocus();
  expect(label("Chrome")).not.toBeVisible();
  press.Tab();
  expect(text("Chrome")).toHaveFocus();
  expect(label("Chrome")).toBeVisible();
  press.ArrowRight();
  expect(text("Chrome")).not.toHaveFocus();
  expect(label("Chrome")).not.toBeVisible();
  expect(text("File")).toHaveFocus();
  expect(label("File")).toBeVisible();
  press.End();
  expect(text("Help")).toHaveFocus();
  expect(label("Help")).toBeVisible();
  press.ArrowRight();
  expect(text("Chrome")).toHaveFocus();
  await wait(expect(label("Chrome")).toBeVisible);
  press.ArrowDown();
  await wait(expect(text("About Google Chrome")).toHaveFocus);
  press.ArrowDown();
  press.ArrowDown();
  press.ArrowDown();
  press.ArrowDown();
  expect(text("Services")).toHaveFocus();
  press.ArrowRight();
  await wait(expect(text("Activity Monitor")).toHaveFocus);
  press.ArrowRight();
  expect(text("File")).toHaveFocus();
  expect(label("File")).toBeVisible();
});

test("renders with no a11y violations", async () => {
  const { baseElement } = render(<ChromeMenuBar />);
  const results = await axe(baseElement);

  expect(results).toHaveNoViolations();
});
