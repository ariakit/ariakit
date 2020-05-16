import * as React from "react";
import { render, press } from "reakit-test-utils";
import ToolbarWithMenu from "..";

describe("<ToolbarWithMenu />", () => {
  test("renders toolbar with open / close menu", () => {
    const { getByText: text } = render(<ToolbarWithMenu />);

    // 1. Toolbar items are visible
    expect(text("Apples")).toBeVisible();
    expect(text("Oranges")).toBeVisible();
    expect(text("Other Fruits")).toBeVisible();

    // 2. Menu is closed
    expect(text("Pears")).not.toBeVisible();
    expect(text("Kiwis")).not.toBeVisible();
    expect(text("Lemons")).not.toBeVisible();

    // 3. Can navigate toolbar items
    press.Tab();
    expect(text("Apples")).toHaveFocus();
    press.ArrowRight();
    expect(text("Oranges")).toHaveFocus();
    press.ArrowLeft();
    expect(text("Apples")).toHaveFocus();
    press.ArrowRight();
    press.ArrowRight();
    expect(text("Other Fruits")).toHaveFocus();

    // 4. Can open the menu
    press.ArrowDown();
    expect(text("Pears")).toBeVisible();
    expect(text("Kiwis")).toBeVisible();
    expect(text("Lemons")).toBeVisible();
    expect(text("Pears")).toHaveFocus();

    // 5. Can navigate the menu
    press.ArrowDown();
    expect(text("Kiwis")).toHaveFocus();
    press.ArrowDown();
    expect(text("Lemons")).toHaveFocus();
    press.ArrowUp();
    expect(text("Kiwis")).toHaveFocus();

    // 6. Can close the menu
    press.Escape();
    expect(text("Pears")).not.toBeVisible();
    expect(text("Kiwis")).not.toBeVisible();
    expect(text("Lemons")).not.toBeVisible();
    expect(text("Other Fruits")).toHaveFocus();
  });
});
