import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/issues/7235
test("keeps the nested action interactive", async () => {
  const card = q.alertdialog("Any direction");
  await click(q.within(card).button("Undo archive"));

  expect(card).toBeVisible();
  expect(q.text("Undo ran without starting a swipe.")).toBeVisible();
});

// https://github.com/ariakit/ariakit/issues/7235
test("advances and restores focus when focused cards are dismissed", async () => {
  const headings = [
    "Logical end",
    "Vertical lane",
    "Any direction",
    "Touch only",
    "Swipe locked",
  ];

  for (const [index, heading] of headings.entries()) {
    const card = q.alertdialog(heading);
    await click(q.within(card).button(`Dismiss ${heading}`));
    const nextHeading = headings[index + 1];
    if (nextHeading) {
      await expect.poll(() => q.alertdialog(nextHeading)).toHaveFocus();
    }
  }

  expect(q.alertdialog.all()).toHaveLength(0);
  await expect.poll(() => q.button("Reset")).toHaveFocus();
  expect(q.text("Inbox cleared")).toBeVisible();
  expect(
    document.querySelector("[data-notifications][hidden]"),
  ).not.toHaveAttribute("data-paused");
});
