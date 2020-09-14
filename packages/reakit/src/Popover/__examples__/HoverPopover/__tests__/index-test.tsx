import * as React from "react";
import { axe, focus, hover, press, render, wait } from "reakit-test-utils";
import HoverPopover from "..";

test("toggle popover on hovering the button", async () => {
  const { baseElement, getByText, getByLabelText } = render(<HoverPopover />);
  const popover = getByLabelText(
    "Preview of the profile of John Doe (@JohnDoe)"
  );
  expect(popover).not.toBeVisible();
  hover(getByText("@JohnDoe"));
  await wait(expect(popover).toBeVisible);
  hover(baseElement);
  await wait(expect(popover).not.toBeVisible);
});

test("toggle popover on pressing the related button while navigating with keyboard", async () => {
  const { getByText, getByLabelText } = render(<HoverPopover />);
  const popover = getByLabelText(
    "Preview of the profile of John Doe (@JohnDoe)"
  );
  expect(popover).not.toBeVisible();
  focus(getByText("See the preview of the profile of @JohnDoe"));
  press.Space();
  await wait(expect(popover).toBeVisible);
  press.Space();
  await wait(expect(popover).not.toBeVisible);
});

test("renders with no a11y violations", async () => {
  const { baseElement } = render(<HoverPopover />);
  const results = await axe(baseElement);

  expect(results).toHaveNoViolations();
});
