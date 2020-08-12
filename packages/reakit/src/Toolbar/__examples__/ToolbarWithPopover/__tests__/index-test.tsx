import * as React from "react";
import { render, press, axe } from "reakit-test-utils";
import ToolbarWithPopover from "..";

test("renders toolbar items with closed popover", () => {
  const { getByText: text, getByLabelText: labelText } = render(
    <ToolbarWithPopover />
  );

  expect(text("Beach")).toBeVisible();
  expect(text("Mountain")).toBeVisible();
  expect(text("Mars")).toBeVisible();

  expect(labelText("Trip to Mars details")).not.toBeVisible();
});

test("allows to navigate toolbar items through keyboard", () => {
  const { getByText: text } = render(<ToolbarWithPopover />);

  press.Tab();
  expect(text("Beach")).toHaveFocus();

  press.ArrowRight();
  expect(text("Mountain")).toHaveFocus();

  press.ArrowLeft();
  expect(text("Beach")).toHaveFocus();

  press.ArrowRight();
  press.ArrowRight();
  expect(text("Mars")).toHaveFocus();

  press.ArrowLeft();
  expect(text("Mountain")).toHaveFocus();
});

test("allows to open / close the popover through keyboard", () => {
  const { getByText: text, getByLabelText: labelText } = render(
    <ToolbarWithPopover />
  );

  press.Tab();
  expect(text("Beach")).toHaveFocus();

  press.ArrowRight();
  press.ArrowRight();

  expect(text("Mars")).toHaveFocus();

  press.Enter();
  expect(labelText("Trip to Mars details")).toBeVisible();
  expect(labelText("Trip to Mars details")).toHaveFocus();

  press.Escape();
  expect(labelText("Trip to Mars details")).not.toBeVisible();
  expect(text("Mars")).toHaveFocus();
});

test("renders with no a11y violations", async () => {
  const { baseElement } = render(<ToolbarWithPopover />);
  const results = await axe(baseElement);

  expect(results).toHaveNoViolations();
});
