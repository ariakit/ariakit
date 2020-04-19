import * as React from "react";
import { click, hover, press, render, wait } from "reakit-test-utils";
import PopoverWithButton from "..";

test("show user profile and toggle follow/unfollow button", async () => {
  const { getByText, getByLabelText } = render(<PopoverWithButton />);
  const disclosure = getByText("@JohnDoe");
  expect(getByLabelText("Toggle @JohnDoe's profile")).not.toHaveTextContent(
    "don't follow"
  );
  const popover = getByLabelText("Profile of John Doe");
  expect(popover).not.toBeVisible();
  hover(disclosure);
  await wait(expect(popover).toBeVisible);
  const button = getByText("Unfollow");
  click(button);
  press.Escape();
  expect(popover).not.toBeVisible();
  expect(getByLabelText("Toggle @JohnDoe's profile")).toHaveTextContent(
    "don't follow"
  );
});
