import * as React from "react";
import { render, hover, click, wait, press } from "reakit-test-utils";
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
  expect(text("")).not.toHaveFocus();
  expect(label("")).not.toBeVisible();
  press.Tab();
  expect(text("")).toHaveFocus();
  expect(label("")).toBeVisible();
  press.ArrowRight();
  expect(text("")).not.toHaveFocus();
  expect(label("")).not.toBeVisible();
  expect(text("Chrome")).toHaveFocus();
  expect(label("Chrome")).toBeVisible();
  press.End();
  expect(text("Help")).toHaveFocus();
  expect(label("Help")).toBeVisible();
  press.ArrowRight();
  expect(text("")).toHaveFocus();
  expect(label("")).toBeVisible();
  press.ArrowDown();
  await wait(expect(text("About This Mac")).toHaveFocus);
  press.ArrowDown();
  press.ArrowDown();
  expect(text("Location")).toHaveFocus();
  press.ArrowRight();
  await wait(expect(text("Network 1")).toHaveFocus);
  press.ArrowRight();
  expect(text("Chrome")).toHaveFocus();
  expect(label("Chrome")).toBeVisible();
});
