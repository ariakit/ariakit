import * as React from "react";
import { click, focus, render, wait, axe } from "reakit-test-utils";
import DialogWithFocusLoss from "..";

test("open dialog", () => {
  const { getByText: text, getByLabelText: label } = render(
    <DialogWithFocusLoss />
  );
  click(text("Open dialog"));
  expect(label("Focus loss")).toBeVisible();
  expect(text("Blur on click")).toHaveFocus();
});

test("blur on click", () => {
  const { getByText: text, getByLabelText: label } = render(
    <DialogWithFocusLoss />
  );
  click(text("Open dialog"));
  click(text("Blur on click"));
  expect(label("Focus loss")).toBeVisible();
  expect(label("Focus loss")).toHaveFocus();
});

test("unmount on focus", async () => {
  const { getByText: text, getByLabelText: label } = render(
    <DialogWithFocusLoss />
  );
  click(text("Open dialog"));
  focus(text("Unmount on focus"));
  expect(label("Focus loss")).toBeVisible();
  await wait(expect(label("Focus loss")).toHaveFocus);
});

test("nested blur on click", () => {
  const { getByText: text, getByLabelText: label } = render(
    <DialogWithFocusLoss />
  );
  click(text("Open dialog"));
  click(text("Open nested dialog"));
  click(text("Nested blur on click"));
  expect(label("Nested")).toBeVisible();
  expect(label("Nested")).toHaveFocus();
});

test("nested unmount on focus", async () => {
  const { getByText: text, getByLabelText: label } = render(
    <DialogWithFocusLoss />
  );
  click(text("Open dialog"));
  click(text("Open nested dialog"));
  focus(text("Nested unmount on focus"));
  expect(label("Nested")).toBeVisible();
  await wait(expect(label("Nested")).toHaveFocus);
});

test("renders with no a11y violations", async () => {
  const { baseElement } = render(<DialogWithFocusLoss />);
  const results = await axe(baseElement);

  expect(results).toHaveNoViolations();
});
