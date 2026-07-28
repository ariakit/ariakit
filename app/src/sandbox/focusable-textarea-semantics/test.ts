import { press, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("preserves textarea semantics and keyboard focus visibility", async () => {
  const textarea = q.textbox("Comment");
  expect(textarea).toHaveProperty("tagName", "TEXTAREA");
  expect(textarea).toHaveAttribute(
    "placeholder",
    "Write your comment, be kind",
  );

  await press.Tab();
  expect(textarea).toHaveFocus();
  expect(textarea).toHaveAttribute("data-focus-visible", "true");
});
