import { q } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/pull/7863
test("hides decorative badge icons and keeps meaningful slots exposed", () => {
  const leading = q.within(q.article("Leading icon"));
  const label = leading.text("Purchased");
  expect(label.previousElementSibling).toHaveAttribute("aria-hidden", "true");

  const count = q.within(q.article("Trailing count")).text("12");
  expect(count).toBeVisible();
  expect(count.parentElement).not.toHaveAttribute("aria-hidden");
  expect(q.within(q.article("Meaningful icon")).img("Starred")).toHaveAttribute(
    "aria-hidden",
    "false",
  );
});
