import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/pull/6832#discussion_r3649284696
test("names the input with the label rendered inside the popover", async () => {
  await click(q.combobox("Favorite fruit"));

  expect(q.combobox("Search fruits")).toBeVisible();
});
