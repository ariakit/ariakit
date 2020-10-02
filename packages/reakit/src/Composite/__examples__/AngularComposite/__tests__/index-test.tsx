import * as React from "react";
import { render, screen, press, axe } from "reakit-test-utils";
import AngularComposite from "..";

test("navigate through angular composite", () => {
  render(<AngularComposite />);
  press.Tab();
  expect(screen.getByText("item-1-1")).toHaveFocus();
  press.ArrowRight();
  expect(screen.getByText("item-1-2")).toHaveFocus();
  press.ArrowRight();
  expect(screen.getByText("item-1-3")).toHaveFocus();
  press.ArrowDown();
  expect(screen.getByText("item-2-2")).toHaveFocus();
  press.ArrowUp();
  expect(screen.getByText("item-1-2")).toHaveFocus();
  press.End(null, { ctrlKey: true });
  expect(screen.getByText("item-4-3")).toHaveFocus();
  press.ArrowUp();
  expect(screen.getByText("item-3-2")).toHaveFocus();
  press.ArrowRight();
  expect(screen.getByText("item-3-4")).toHaveFocus();
  press.ArrowDown();
  expect(screen.getByText("item-4-3")).toHaveFocus();
});

test("a11y", async () => {
  const { baseElement } = render(<AngularComposite />);
  expect(await axe(baseElement)).toHaveNoViolations();
});
