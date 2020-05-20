import * as React from "react";
import { render, press, click } from "reakit-test-utils";
import ToolbarWithMenu from "..";

test("renders toolbar items with closed menu", () => {
  const { getByText: text } = render(<ToolbarWithMenu />);

  expect(text("Apples")).toBeVisible();
  expect(text("Oranges")).toBeVisible();
  expect(text("Other Fruits")).toBeVisible();

  expect(text("Pears")).not.toBeVisible();
  expect(text("Kiwis")).not.toBeVisible();
  expect(text("Lemons")).not.toBeVisible();
});

test("can navigate toolbar items through keyboard", () => {
  const { getByText: text } = render(<ToolbarWithMenu />);

  press.Tab();
  expect(text("Apples")).toHaveFocus();

  press.ArrowRight();
  expect(text("Oranges")).toHaveFocus();

  press.ArrowLeft();
  expect(text("Apples")).toHaveFocus();

  press.ArrowRight();
  press.ArrowRight();
  expect(text("Other Fruits")).toHaveFocus();

  press.Enter();
  expect(text("Pears")).toBeVisible();
  expect(text("Pears")).toHaveFocus();
});

test("can open and close the menu through mouse", () => {
  const { getByText: text } = render(<ToolbarWithMenu />);

  click(text("Other Fruits"));
  expect(text("Pears")).toBeVisible();

  click(text("Oranges"));
  expect(text("Pears")).not.toBeVisible();
});

test("can open menu, navigate it and close it through keyboard", () => {
  const { getByText: text } = render(<ToolbarWithMenu />);

  press.Tab();
  expect(text("Apples")).toHaveFocus();
  press.ArrowRight();
  press.ArrowRight();
  expect(text("Other Fruits")).toHaveFocus();
  press.Enter();

  expect(text("Pears")).toHaveFocus();
  expect(text("Pears")).toBeVisible();
  expect(text("Kiwis")).toBeVisible();
  expect(text("Lemons")).toBeVisible();

  press.ArrowDown();
  expect(text("Kiwis")).toHaveFocus();
  press.ArrowDown();
  expect(text("Lemons")).toHaveFocus();
  press.ArrowUp();
  expect(text("Kiwis")).toHaveFocus();

  press.Escape();

  expect(text("Pears")).not.toBeVisible();
  expect(text("Kiwis")).not.toBeVisible();
  expect(text("Lemons")).not.toBeVisible();
  expect(text("Other Fruits")).toHaveFocus();
});

test("opens menu pressing arrow down focusing first item", async () => {
  const { getByText: getText, findByText: findText } = render(
    <ToolbarWithMenu />
  );

  press.Tab();
  expect(getText("Apples")).toHaveFocus();
  press.ArrowRight();
  press.ArrowRight();
  expect(getText("Other Fruits")).toHaveFocus();

  press.ArrowDown();

  const firstMenuItem = await findText("Pears");

  expect(firstMenuItem).toHaveFocus();
  expect(firstMenuItem).toBeVisible();
});

test("opens menu pressing arrow up focusing last item", async () => {
  const { getByText: getText, findByText: findText } = render(
    <ToolbarWithMenu />
  );

  press.Tab();
  expect(getText("Apples")).toHaveFocus();
  press.ArrowRight();
  press.ArrowRight();
  expect(getText("Other Fruits")).toHaveFocus();

  press.ArrowUp();

  const firstMenuItem = await findText("Lemons");

  expect(firstMenuItem).toHaveFocus();
  expect(firstMenuItem).toBeVisible();
});
