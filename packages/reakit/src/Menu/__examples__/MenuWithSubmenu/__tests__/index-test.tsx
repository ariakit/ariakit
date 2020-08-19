import * as React from "react";
import {
  render,
  press,
  hover,
  click,
  wait,
  focus,
  axe,
} from "reakit-test-utils";
import MenuWithSubmenu from "..";

test("open menu", async () => {
  const { getByText: text, getByLabelText: label } = render(
    <MenuWithSubmenu />
  );
  expect(label("Edit")).not.toBeVisible();
  click(text("Edit"));
  await wait(expect(label("Edit")).toBeVisible);
  await wait(expect(label("Edit")).toHaveFocus);
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

test("renders with no a11y violations", async () => {
  const { baseElement } = render(<MenuWithSubmenu />);
  const results = await axe(baseElement);

  expect(results).toHaveNoViolations();
});
