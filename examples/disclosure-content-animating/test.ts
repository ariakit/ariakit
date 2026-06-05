import { expect, test, click, q, waitFor } from "../../browser-test-utils.ts";

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
