import { click, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

// The simulated request takes 1.5 seconds.
const timeout = 3000;

test("hides the follow button until the profile loads", async () => {
  expect(q.status()).toHaveTextContent("Loading profile");
  expect(q.button.maybe("Follow")).not.toBeInTheDocument();
  // The placeholders stay for at least 200 ms after the data arrives.
  await expect
    .poll(() => q.heading.maybe("Maya Chen"), { timeout })
    .toBeInTheDocument();
  expect(q.status()).toHaveTextContent("Profile loaded");
  expect(q.button("Follow")).toBeInTheDocument();
});

// https://github.com/ariakit/ariakit/pull/7993#discussion_r4317370417
test("skips the filled button while the profile loads", async () => {
  expect(q.status()).toHaveTextContent("Loading profile");
  await press.Tab();
  expect(q.button("Reload profile")).toHaveFocus();
});

test("hides the previous profile while it reloads", async () => {
  await expect
    .poll(() => q.heading.maybe("Maya Chen"), { timeout })
    .toBeInTheDocument();
  await click(q.button("Reload profile"));
  expect(q.status()).toHaveTextContent("Loading profile");
  expect(q.heading.maybe("Maya Chen")).not.toBeInTheDocument();
  await expect
    .poll(() => q.heading.maybe("Maya Chen"), { timeout })
    .toBeInTheDocument();
});
