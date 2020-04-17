import * as React from "react";
import { render, press, hover } from "reakit-test-utils";
import VirtualCompositeWithTooltip from "..";

test("show tooltip", () => {
  const { getByText: text, getByLabelText: label } = render(
    <VirtualCompositeWithTooltip />
  );
  expect(text("item1tooltip")).not.toBeVisible();
  press.Tab();
  expect(label("composite")).toHaveFocus();
  expect(text("item1")).toHaveFocus();
  expect(text("item1tooltip")).toBeVisible();
  press.ArrowDown();
  expect(text("item1tooltip")).not.toBeVisible();
  expect(label("composite")).toHaveFocus();
  expect(text("item2")).toHaveFocus();
  expect(text("item2tooltip")).toBeVisible();
  hover(text("item3"));
  expect(text("item2tooltip")).not.toBeVisible();
  expect(label("composite")).toHaveFocus();
  expect(text("item2")).toHaveFocus();
  expect(text("item3tooltip")).toBeVisible();
});
