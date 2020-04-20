import * as React from "react";
import { render, press, hover, click, wait, focus } from "reakit-test-utils";
import MenuWithSubmenu from "..";

test("open menu", async () => {
  const { getByText: text, getByLabelText: label } = render(
    <MenuWithSubmenu />
  );
  expect(label("Edit")).not.toBeVisible();
  click(text("Edit"));
  await wait(expect(label("Edit")).toBeVisible);
  await wait(expect(text("Undo")).toHaveFocus);
});

test("open menu by pressing enter", async () => {
  const { getByText: text, getByLabelText: label } = render(
    <MenuWithSubmenu />
  );
  expect(label("Edit")).not.toBeVisible();
  focus(text("Edit"));
  press.Enter();
  await wait(expect(label("Edit")).toBeVisible);
  await wait(expect(text("Undo")).toHaveFocus);
});

test("open menu by pressing space", async () => {
  const { getByText: text, getByLabelText: label } = render(
    <MenuWithSubmenu />
  );
  expect(label("Edit")).not.toBeVisible();
  focus(text("Edit"));
  press.Space();
  await wait(expect(label("Edit")).toBeVisible);
  await wait(expect(text("Undo")).toHaveFocus);
});

test("open menu by pressing arrow down", async () => {
  const { getByText: text, getByLabelText: label } = render(
    <MenuWithSubmenu />
  );
  expect(label("Edit")).not.toBeVisible();
  focus(text("Edit"));
  press.ArrowDown();
  await wait(expect(label("Edit")).toBeVisible);
  await wait(expect(text("Undo")).toHaveFocus);
});

test("open menu by pressing arrow up", async () => {
  const { getByText: text, getByLabelText: label } = render(
    <MenuWithSubmenu />
  );
  expect(label("Edit")).not.toBeVisible();
  focus(text("Edit"));
  press.ArrowUp();
  await wait(expect(label("Edit")).toBeVisible);
  await wait(expect(text("Substitutions")).toHaveFocus);
});

test("open submenu with click", async () => {
  const { getByText: text, getByLabelText: label } = render(
    <MenuWithSubmenu />
  );
  click(text("Edit"));
  click(text("Find"));
  await wait(expect(label("Find")).toBeVisible);
  await wait(expect(text("Find")).toHaveFocus);
});

test("open submenu with hover", async () => {
  const { getByText: text, getByLabelText: label } = render(
    <MenuWithSubmenu />
  );
  click(text("Edit"));
  hover(text("Find"));
  await wait(expect(label("Find")).toBeVisible);
  await wait(expect(text("Find")).toHaveFocus);
});

test("open submenu by pressing enter", async () => {
  const { getByText: text, getByLabelText: label } = render(
    <MenuWithSubmenu />
  );
  click(text("Edit"));
  focus(text("Find"));
  press.Enter();
  await wait(expect(label("Find")).toBeVisible);
  await wait(expect(text("Search the Web...")).toHaveFocus);
});

test("open submenu by pressing space", async () => {
  const { getByText: text, getByLabelText: label } = render(
    <MenuWithSubmenu />
  );
  click(text("Edit"));
  focus(text("Find"));
  press.Space();
  await wait(expect(label("Find")).toBeVisible);
  await wait(expect(text("Search the Web...")).toHaveFocus);
});

test("open submenu by pressing arrow right", async () => {
  const { getByText: text, getByLabelText: label } = render(
    <MenuWithSubmenu />
  );
  click(text("Edit"));
  focus(text("Find"));
  press.ArrowRight();
  await wait(expect(label("Find")).toBeVisible);
  await wait(expect(text("Search the Web...")).toHaveFocus);
});
