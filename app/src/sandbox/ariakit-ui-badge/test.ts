import { q } from "@ariakit/test";
import { expect, test } from "vitest";

test("puts plain text and numbers in a label", () => {
  const box = q.within(q.article("Plain text children"));
  for (const text of ["Text", "0", "3 new", "Icon"]) {
    expect(box.text(text).parentElement).toHaveClass("badge");
  }
});

// https://github.com/ariakit/ariakit/pull/7863
test("keeps badge slots accessible unless explicitly hidden", () => {
  expect(q.within(q.article("Decorative icon")).text("★")).toHaveAttribute(
    "aria-hidden",
    "true",
  );

  const count = q.within(q.article("Trailing count")).text("12");
  expect(count).toBeVisible();
  expect(count.parentElement).not.toHaveAttribute("aria-hidden");
  expect(q.within(q.article("Meaningful icon")).img("Starred")).toBeVisible();
});
