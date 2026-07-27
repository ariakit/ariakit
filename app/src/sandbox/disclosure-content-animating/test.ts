import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

const transitionTimeout = 500;

// https://github.com/ariakit/ariakit/issues/4115
test("reports animating while opening and closing", async () => {
  expect(q.text("Content")).not.toHaveAttribute("data-animating");

  await click(q.button("Toggle"));
  expect(q.text("Content")).toHaveAttribute("data-animating");
  await expect
    .poll(q.text.lazy("Content"), { timeout: transitionTimeout })
    .not.toHaveAttribute("data-animating");

  await click(q.button("Toggle"));
  expect(q.text("Content")).toHaveAttribute("data-animating");
  await expect
    .poll(q.text.lazy("Content"), { timeout: transitionTimeout })
    .not.toHaveAttribute("data-animating");
});
