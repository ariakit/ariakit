import { click, q, type } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/issues/7059
test("an own __proto__ render prop does not remount the element", async () => {
  await type("Haz", q.textbox("Profile name"));
  expect(q.textbox("Profile name")).toHaveValue("Haz");

  await click(q.button("Refresh payload"));

  expect(q.textbox("Profile name")).toHaveValue("Haz");
});
