import { hover, q, sleep } from "@ariakit/test";
import { expect, test } from "vitest";

// The same setup as the disabled menu buttons below, so their assertions fail
// if hovering ever stops opening a menu at all. The poll is what establishes
// that a menu needs more than `hover`'s own settle to appear.
test("enabled menu button opens its menu on hover", async () => {
  await hover(q.button("Hover enabled"));
  await expect.poll(q.menu.lazy("Hover enabled")).toBeVisible();
});

// https://github.com/ariakit/ariakit/issues/7115
test("disabled menu button does not open its menu on hover", async () => {
  await hover(q.button("Hover MenuButton props"));
  // These providers use `timeout={0}`, so a menu that opens does so as soon as
  // its portal mounts, which is the wait the test above measures. Cross it to
  // give the assertion below a chance to fail.
  await sleep();
  expect(q.menu("Hover MenuButton props")).not.toBeInTheDocument();
});

// https://github.com/ariakit/ariakit/issues/7115
test("disabled rendered button does not open its menu on hover", async () => {
  await hover(q.button("Hover render props"));
  // Same portal-mount wait as the test above.
  await sleep();
  expect(q.menu("Hover render props")).not.toBeInTheDocument();
});
