import { press, q } from "@ariakit/test";
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
  // The filled button is the only control in the example.
  await press.Tab();
  expect(document.body).toHaveFocus();
  await expect
    .poll(() => q.button.maybe("Follow"), { timeout })
    .toBeInTheDocument();
  await press.Tab();
  expect(q.button("Follow")).toHaveFocus();
});
