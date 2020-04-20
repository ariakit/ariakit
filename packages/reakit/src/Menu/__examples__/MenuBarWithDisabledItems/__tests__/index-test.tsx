import * as React from "react";
import { render, press, hover, click, wait } from "reakit-test-utils";
import MenuBarWithDisabledItems from "..";

test("open menus with hover except the disabled one", async () => {
  const { getByText: text, getByLabelText: label } = render(
    <MenuBarWithDisabledItems />
  );
  expect(label("File")).not.toBeVisible();
  click(text("File"));
  await wait(expect(label("File")).toBeVisible);
  expect(text("File")).toHaveFocus();
  hover(text("View"));
  expect(label("File")).toBeVisible();
  expect(text("File")).toHaveFocus();
  hover(text("Edit"));
  await wait(expect(label("Edit")).toBeVisible);
  expect(text("Edit")).toHaveFocus();
});

test("open menus with click except the disabled one", async () => {
  const { getByText: text, getByLabelText: label, baseElement } = render(
    <MenuBarWithDisabledItems />
  );
  click(text("File"));
  await wait(expect(label("File")).toBeVisible);
  expect(text("File")).toHaveFocus();
  click(text("View"));
  expect(baseElement).toHaveFocus();
  click(text("Edit"));
  await wait(expect(label("Edit")).toBeVisible);
  expect(text("Edit")).toHaveFocus();
});

test("open menus with keyboard except the disabled one", async () => {
  const { getByText: text, getByLabelText: label } = render(
    <MenuBarWithDisabledItems />
  );
  press.Tab();
  expect(text("File")).toHaveFocus();
  await wait(expect(label("File")).toBeVisible);
  press.ArrowRight();
  expect(text("View")).toHaveFocus();
  await wait(expect(label("File")).not.toBeVisible);
  await wait(expect(label("View")).not.toBeVisible);
  press.ArrowDown();
  await wait(expect(label("File")).not.toBeVisible);
  await wait(expect(label("View")).not.toBeVisible);
  press.ArrowUp();
  await wait(expect(label("File")).not.toBeVisible);
  await wait(expect(label("View")).not.toBeVisible);
  press.Enter();
  await wait(expect(label("File")).not.toBeVisible);
  await wait(expect(label("View")).not.toBeVisible);
  press.Space();
  await wait(expect(label("File")).not.toBeVisible);
  await wait(expect(label("View")).not.toBeVisible);
  press.ArrowRight();
  expect(text("Edit")).toHaveFocus();
  await wait(expect(label("Edit")).toBeVisible);
  press.ArrowRight();
  expect(text("File")).toHaveFocus();
  await wait(expect(label("File")).toBeVisible);
});

test("open submenus with click except the disabled one", async () => {
  const { getByText: text, getByLabelText: label } = render(
    <MenuBarWithDisabledItems />
  );
  click(text("Edit"));
  click(text("Find"));
  expect(text("Find")).toHaveFocus();
  await wait(expect(label("Find")).toBeVisible);
  expect(text("Find")).toHaveFocus();
  click(text("Spelling and Grammar"));
  await wait(expect(label("Find")).not.toBeVisible);
  expect(label("Edit")).toHaveFocus();
});

test("open submenus with hover except the disabled one", async () => {
  const { getByText: text, getByLabelText: label } = render(
    <MenuBarWithDisabledItems />
  );
  click(text("Edit"));
  hover(text("Find"));
  expect(text("Find")).toHaveFocus();
  await wait(expect(label("Find")).toBeVisible);
  expect(text("Find")).toHaveFocus();
  hover(text("Spelling and Grammar"));
  await wait(expect(label("Find")).not.toBeVisible);
  expect(label("Edit")).toHaveFocus();
});
