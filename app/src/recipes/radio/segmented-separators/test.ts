import { press, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("skips the disabled segment with the arrow keys", async () => {
  await press.Tab();
  await press.ArrowRight();
  await press.ArrowRight();
  expect(q.radio("Month")).toBeChecked();
  await press.ArrowRight();
  expect(q.radio("Year")).toBeDisabled();
  expect(q.radio("Day")).toBeChecked();
});
