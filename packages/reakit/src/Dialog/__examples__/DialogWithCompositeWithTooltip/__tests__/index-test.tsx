import * as React from "react";
import { click, render } from "reakit-test-utils";
import DialogWithCompositeWithTooltip from "..";

test("open dialog with composite with tooltip", () => {
  const { getByText: text, getByLabelText: label } = render(
    <DialogWithCompositeWithTooltip />
  );
  click(text("Disclosure"));
  expect(label("Dialog")).toBeVisible();
  expect(text("item1")).toHaveFocus();
  expect(text("item1tooltip")).toBeVisible();
});
