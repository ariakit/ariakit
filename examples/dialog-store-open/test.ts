import { expect, test, click, press, q } from "../../browser-test-utils.ts";

test("keep dialog open when pressing escape", async () => {
  expect(q.dialog()).toBeVisible();
  await press.Escape();
  expect(q.dialog()).toBeVisible();
  expect(q.button("OK")).toHaveFocus();
});

test("keep dialog open when clicking outside", async () => {
  expect(q.dialog()).toBeVisible();
  await click(document.body);
  expect(q.dialog()).toBeVisible();
  expect(q.button("OK")).toHaveFocus();
});
