import * as React from "react";
import { render, press, axe } from "reakit-test-utils";
import AngularComposite from "..";

test("navigate through angular composite", () => {
  const { getByText: text } = render(<AngularComposite />);
  press.Tab();
  expect(text("item-1-1")).toHaveFocus();
  press.ArrowRight();
  expect(text("item-1-2")).toHaveFocus();
  press.ArrowRight();
  expect(text("item-1-3")).toHaveFocus();
  press.ArrowDown();
  expect(text("item-2-2")).toHaveFocus();
  press.ArrowUp();
  expect(text("item-1-2")).toHaveFocus();
  press.End(null, { ctrlKey: true });
  expect(text("item-4-3")).toHaveFocus();
  press.ArrowUp();
  expect(text("item-3-2")).toHaveFocus();
  press.ArrowRight();
  expect(text("item-3-4")).toHaveFocus();
  press.ArrowDown();
  expect(text("item-4-3")).toHaveFocus();
});

test("renders with no a11y violations", async () => {
  const { baseElement } = render(<AngularComposite />);
  const results = await axe(baseElement);

  expect(results).toHaveNoViolations();
});
