import { focus, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

// The scroll button before the group hides in a browser until the group
// scrolls, but happy-dom renders no styles, so the Playwright test covers the
// Tab order.
test("skips the disabled segment with the arrow keys", async () => {
  await focus(q.radio("Day"));
  await press.ArrowRight();
  await press.ArrowRight();
  expect(q.radio("Month")).toBeChecked();
  await press.ArrowRight();
  expect(q.radio("Year")).toBeDisabled();
  expect(q.radio("Day")).toBeChecked();
});

test("puts a hidden separator before each segment after the first", () => {
  const card = (name: string) => q.radio(name).closest("label");
  expect(card("Day")?.previousElementSibling).toBeNull();
  for (const name of ["Week", "Month", "Year"]) {
    expect(card(name)?.previousElementSibling).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  }
});
