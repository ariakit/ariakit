import * as React from "react";
import { hover, render, wait } from "reakit-test-utils";
import HoverPopover from "..";

test("toggle popover on hovering the button", async () => {
  const { baseElement, getByText, getByLabelText } = render(<HoverPopover />);
  const popover = getByLabelText("Preview of John Doe's profile");
  expect(popover).not.toBeVisible();
  hover(getByText("@JohnDoe"));
  await wait(expect(popover).toBeVisible);
  hover(baseElement);
  await wait(expect(popover).not.toBeVisible);
});
