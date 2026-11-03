import { click, q, sleep } from "@ariakit/test";
import { expect, test } from "vitest";

test("names an icon button Copy by default", () => {
  expect(q.button("Copy")).toHaveAccessibleName("Copy");
});

test("reports a failure when the value function throws", async () => {
  await click(q.button("Copy broken value"));
  expect(await q.button.wait("Couldn't copy")).toBeInTheDocument();
});

test("skips the copy when onClick prevents the default", async () => {
  const copy = q.button("Copy secret");
  await click(copy);
  // A copy would settle after the click, and no state tracks a copy that
  // doesn't start, so the unchanged name needs a delay before it means
  // anything.
  await sleep();
  expect(copy).toHaveAccessibleName("Copy secret");
  await click(q.checkbox("I understand this key is secret"));
  await click(copy);
  expect(await q.button.wait("Copied")).toBe(copy);
});
