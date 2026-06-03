import { q } from "@ariakit/test";
import { expect, test } from "vitest";

// Reproduces https://github.com/ariakit/ariakit/issues/6216

test("vertical renderer measures a horizontal group's height along the parent axis", () => {
  // The group (index 2) is horizontal with 5 columns of 140px width each
  // (= 700px along the x-axis). Its columns run along the cross axis, so the
  // group's height should be ~one row tall: the group slot starts at
  // ROW_HEIGHT * 2 = 80px and the row right after it sits at ROW_HEIGHT * 3 =
  // 120px. Before the fix, `getItemSize` flipped the measured axis to the
  // group's own orientation and summed the columns' widths as the group's
  // *height*, reserving 700px of vertical space and pushing "row-3" to 780px.
  expect(q.button.ensure("group")).toHaveStyle({ top: "80px" });
  expect(q.button.ensure("row-3")).toHaveStyle({ top: "120px" });
});

test("nested cross-oriented group is sized by its largest child extent", () => {
  // `nested-group` wraps a horizontal group whose columns are 28px and 36px
  // tall. Measured through metadata alone (no rendered element), the group's
  // height is the largest column extent (36px) rather than the sum of the
  // columns' widths, so "nested-row-2" sits at ROW_HEIGHT + 36 = 76px. Before
  // the fix it summed the columns' widths (280px), pushing it to 320px.
  expect(q.button.ensure("nested-row-2")).toHaveStyle({ top: "76px" });
});
