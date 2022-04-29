import { blur, getByRole, hover, press, render, waitFor } from "ariakit-test";
import ToolTip from ".";

const waitForTooltipToNotVisible = (timeout = 2100) =>
  waitFor(expect(getByRole("tooltip")).not.toBeVisible, {
    timeout,
  });

test("show tooltip animated on hover", async () => {
  const { baseElement } = render(<ToolTip />);
  expect(getByRole("tooltip", { hidden: true })).not.toBeVisible();
  await hover(getByRole("button"));
  expect(getByRole("tooltip")).toBeVisible();
  await hover(baseElement);
  await waitForTooltipToNotVisible();
});

test("show tooltip animated on focus", async () => {
  render(<ToolTip />);
  expect(getByRole("tooltip", { hidden: true })).not.toBeVisible();
  await press.Tab();
  expect(getByRole("tooltip")).toBeVisible();
  await blur();
  await waitForTooltipToNotVisible();
});
