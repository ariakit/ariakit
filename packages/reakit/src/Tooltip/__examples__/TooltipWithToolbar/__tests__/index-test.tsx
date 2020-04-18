import * as React from "react";
import { render, press, hover } from "reakit-test-utils";
import CompositeWithTooltip from "..";

test("show tooltip", () => {
  const { getByText: text } = render(<CompositeWithTooltip />);
  expect(text("item1tooltip")).not.toBeVisible();
  press.Tab();
  expect(text("item1")).toHaveFocus();
  expect(text("item1tooltip")).toBeVisible();
  press.ArrowRight();
  expect(text("item1tooltip")).not.toBeVisible();
  expect(text("item2")).toHaveFocus();
  expect(text("item2tooltip")).toBeVisible();
  hover(text("item3"));
  expect(text("item2tooltip")).not.toBeVisible();
  expect(text("item2")).toHaveFocus();
  expect(text("item3tooltip")).toBeVisible();
  press.Escape();
  expect(text("item2")).toHaveFocus();
  expect(text("item3tooltip")).not.toBeVisible();
});
