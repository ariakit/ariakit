import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

// The slow request takes 1.5 seconds.
const timeout = 3000;

test("names each speed by its label and describes it by its latency", () => {
  expect(q.radio("Fast")).toHaveAccessibleDescription("50 ms");
  expect(q.radio("Medium")).toHaveAccessibleDescription("250 ms");
  expect(q.radio("Slow")).toHaveAccessibleDescription("1500 ms");
});

test("hides the previous contact while it reloads", async () => {
  await expect
    .poll(() => q.button.maybe("Message"), { timeout })
    .toBeInTheDocument();
  await click(q.radio("Slow"));
  expect(q.status()).toHaveTextContent("Loading contact");
  expect(q.button.maybe("Message")).not.toBeInTheDocument();
  await expect
    .poll(() => q.button.maybe("Message"), { timeout })
    .toBeInTheDocument();
  expect(q.status()).toHaveTextContent("Contact loaded");
});
