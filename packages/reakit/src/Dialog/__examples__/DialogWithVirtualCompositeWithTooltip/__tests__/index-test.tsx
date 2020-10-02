import * as React from "react";
import { click, screen, render, wait, axe } from "reakit-test-utils";
import DialogWithVirtualCompositeWithTooltip from "..";

test("open dialog with composite with tooltip", async () => {
  render(<DialogWithVirtualCompositeWithTooltip />);
  click(screen.getByText("Disclosure"));
  expect(screen.getByLabelText("Dialog")).toBeVisible();
  expect(screen.getByText("item1")).toHaveFocus();
  await wait(expect(screen.getByLabelText("composite")).toHaveFocus);
  expect(screen.getByText("item1tooltip")).toBeVisible();
});

test("a11y", async () => {
  const { baseElement } = render(<DialogWithVirtualCompositeWithTooltip />);
  expect(await axe(baseElement)).toHaveNoViolations();
});
