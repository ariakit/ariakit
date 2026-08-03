import { click, hover, press, q, sleep } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/issues/7028
test("forwarded undefined autoFocusOnShow keeps focus outside the hovercard", async () => {
  await hover(q.link("@ariakit/react"));
  await expect.poll(() => q.dialog("Ariakit package")).toBeVisible();
  // Asserting that focus does *not* move has no observable state to retry
  // against, so settle the popover's auto-focus effect before asserting.
  await sleep();
  expect(q.button("Star")).not.toHaveFocus();
});

// https://github.com/ariakit/ariakit/issues/7028
test("forwarded undefined focusable keeps the tab panel out of the tab order", async () => {
  expect(q.tabpanel("Links")).not.toHaveAttribute("tabindex");
});

// https://github.com/ariakit/ariakit/issues/7028
test("forwarded undefined clickOnEnter keeps Enter inert on a native checkbox", async () => {
  const checkbox = q.checkbox.ensure("Subscribe");
  await click(checkbox);
  expect(checkbox).toBeChecked();
  await press.Enter(checkbox);
  expect(checkbox).toBeChecked();
});
