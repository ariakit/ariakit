import { focus, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("names the group and checks the default theme", () => {
  const group = q.within(q.radiogroup("Theme"));
  expect(group.radio("System")).toBeChecked();
  expect(group.radio("Light")).not.toBeChecked();
});

// The scroll button before the group hides in a browser until the group
// scrolls, but happy-dom renders no styles, so the Playwright test covers the
// Tab order.
test("checks the next segment with an arrow key", async () => {
  await focus(q.radio("System"));
  expect(q.radio("System")).toHaveFocus();
  await press.ArrowRight();
  expect(q.radio("Light")).toHaveFocus();
  expect(q.radio("Light")).toBeChecked();
  expect(q.radio("System")).not.toBeChecked();
});
