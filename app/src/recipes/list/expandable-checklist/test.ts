import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("moves focus to the next step after marking a step as done", async () => {
  await click(q.button("Mark as done"));
  expect(q.button(/Invite your team/)).toHaveFocus();
  expect(q.button(/Invite your team/)).toHaveAttribute("aria-expanded", "true");

  await click(q.button("Mark as done"));
  expect(q.button(/Create your first project/)).toHaveFocus();
  expect(q.button(/Create your first project/)).toHaveAttribute(
    "aria-expanded",
    "true",
  );

  // With no step left, focus stays on the button of the finished step.
  await click(q.button("Mark as done"));
  expect(q.button(/Create your first project/)).toHaveFocus();
  expect(q.button(/Create your first project/)).toHaveAttribute(
    "aria-expanded",
    "false",
  );
});
