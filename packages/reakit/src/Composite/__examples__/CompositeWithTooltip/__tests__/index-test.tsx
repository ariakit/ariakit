import * as React from "react";
import { render, press, hover, axe } from "reakit-test-utils";
import CompositeWithTooltip from "..";

test("show tooltip", () => {
  const { getByText: text } = render(<CompositeWithTooltip />);
  expect(text("item1tooltip")).not.toBeVisible();
  press.Tab();
  expect(text("item1")).toHaveFocus();
  expect(text("item1tooltip")).toBeVisible();
  press.ArrowDown();
  expect(text("item1tooltip")).not.toBeVisible();
  expect(text("item2")).toHaveFocus();
  expect(text("item2tooltip")).toBeVisible();
  hover(text("item3"));
  expect(text("item2tooltip")).not.toBeVisible();
  expect(text("item2")).toHaveFocus();
  expect(text("item3tooltip")).toBeVisible();
});

test("renders with no a11y violations", async () => {
  const { baseElement } = render(<CompositeWithTooltip />);
  const results = await axe(baseElement);

  expect(results).toHaveNoViolations();
});
