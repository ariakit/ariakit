import * as React from "react";
import { click, render, wait } from "reakit-test-utils";
import DialogWithVirtualCompositeWithTooltip from "..";

test("open dialog with composite with tooltip", async () => {
  const { getByText: text, getByLabelText: label } = render(
    <DialogWithVirtualCompositeWithTooltip />
  );
  click(text("Disclosure"));
  expect(label("Dialog")).toBeVisible();
  expect(text("item1")).toHaveFocus();
  await wait(expect(label("composite")).toHaveFocus);
  expect(text("item1tooltip")).toBeVisible();
});
