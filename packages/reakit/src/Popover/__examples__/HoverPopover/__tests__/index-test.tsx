import * as React from "react";
import { hover, render, wait } from "reakit-test-utils";
import PopoverWithButton from "..";

test("toggle popover on hovering the button", async () => {
  const { getByText, getByLabelText, getByTestId } = render(
    <>
      <PopoverWithButton />
      <span data-testid="another-element-to-focus" />
    </>
  );
  const popover = getByLabelText("Profile of John Doe");
  expect(popover).not.toBeVisible();
  hover(getByText("@JohnDoe"));
  await wait(expect(popover).toBeVisible);
  hover(getByTestId("another-element-to-focus"));
  await wait(expect(popover).not.toBeVisible);
});
