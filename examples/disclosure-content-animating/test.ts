import { click, q, waitFor } from "@ariakit/test";
import { expect, test } from "vitest";

const transitionTimeout = 1500;

test("https://github.com/ariakit/ariakit/issues/4115", async () => {
  expect(q.text("Content")).not.toHaveAttribute("data-animating");

  await click(q.button("Toggle"));
  expect(q.text("Content")).toHaveAttribute("data-animating");
  await waitFor(
    () => expect(q.text("Content")).not.toHaveAttribute("data-animating"),
    { timeout: transitionTimeout },
  );

  await click(q.button("Toggle"));
  expect(q.text("Content")).toHaveAttribute("data-animating");
  await waitFor(
    () => expect(q.text("Content")).not.toHaveAttribute("data-animating"),
    { timeout: transitionTimeout },
  );
});
