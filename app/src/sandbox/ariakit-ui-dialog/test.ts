import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/issues/8361
test("names an icon-only dismiss whose children are empty", async () => {
  await click(q.button("View reminders"));
  const dismiss = q.within(q.dialog("Reminders")).button("Dismiss popup");
  expect(dismiss.querySelector("svg")).toBeInTheDocument();
  await click(dismiss);
  await expect.poll(q.dialog.maybe.lazy("Reminders")).not.toBeInTheDocument();
});
