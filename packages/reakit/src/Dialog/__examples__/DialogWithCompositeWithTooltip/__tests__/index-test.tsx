import * as React from "react";
import { click, render, axe } from "reakit-test-utils";
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

test("renders with no a11y violations", async () => {
  const { baseElement } = render(<DialogWithCompositeWithTooltip />);
  const results = await axe(baseElement);

  expect(results).toHaveNoViolations();
});
