import * as React from "react";
import { click, focus, press, render, wait, axe } from "reakit-test-utils";
import Input from "../index";

test("should open modal content tab", async () => {
  const { getByText, getByLabelText } = render(<Input />);

  const input = getByLabelText("Password");

  const showButton = getByText("Show");
  expect(showButton).toBeVisible();
  expect(input).toHaveAttribute("type", "password");

  click(showButton);

  const hideButton = getByText("Hide");
  expect(hideButton).toBeVisible();
  expect(input).toHaveAttribute("type", "text");
});

test("renders with no a11y violations", async () => {
  const { baseElement } = render(<Input />);
  const results = await axe(baseElement);

  expect(results).toHaveNoViolations();
});
