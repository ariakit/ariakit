import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("https://github.com/ariakit/ariakit/issues/4115", async () => {
  expect(q.text("Content")).not.toHaveAttribute("data-animating");

  await click(q.button("Toggle"));
  expect(q.text("Content")).toHaveAttribute("data-animating");
  await expect
    .poll(() => q.text("Content"))
    .not.toHaveAttribute("data-animating");

  await click(q.button("Toggle"));
  expect(q.text("Content")).toHaveAttribute("data-animating");
  await expect
    .poll(() => q.text("Content"))
    .not.toHaveAttribute("data-animating");
});
