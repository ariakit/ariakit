import * as React from "react";
import { click, press, render, axe } from "reakit-test-utils";
import ButtonWithTooltip from "..";

test("two-state button with tooltip", () => {
  const { getByText: text } = render(<ButtonWithTooltip />);
  const buttonUnlocked = text("🔓");
  expect(buttonUnlocked).toBeVisible();
  press.Tab();
  expect(text("Click to lock")).toBeVisible();
  expect(text("It's unlocked!")).toBeVisible();
  click(buttonUnlocked);
  const buttonLocked = text("🔒");
  expect(buttonLocked).toBeVisible();
  expect(text("Click to unlock")).toBeVisible();
  expect(text("It's locked!")).toBeVisible();
  press.Space();
  expect(buttonUnlocked).toBeVisible();
});

test("renders with no a11y violations", async () => {
  const { baseElement } = render(<ButtonWithTooltip />);
  const results = await axe(baseElement);

  expect(results).toHaveNoViolations();
});
