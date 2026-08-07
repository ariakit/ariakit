import { press, q } from "@ariakit/test";
import { expect, test } from "vitest";

// The scroll side of the presentation is browser-only and lives in
// test-browser.ts.
// #7068 redefines the focus contract #6832 established here: this popup mounts
// while nothing owns focus, so it takes focus itself. One that opens while
// another element owns focus still leaves it alone, which
// combobox-select-focusless-open covers.
// https://github.com/ariakit/ariakit/pull/6832
// https://github.com/ariakit/ariakit/issues/7068
test("takes focus when the popup starts open", async () => {
  await expect.poll(q.option.lazy("Onion")).toHaveAttribute("data-active-item");

  // Virtual focus keeps DOM focus on the select, not on the active item.
  expect(q.combobox("Vegetable")).toHaveFocus();
});

// https://github.com/ariakit/ariakit/issues/7068
test("navigates from the control when the popup starts open", async () => {
  await expect.poll(q.option.lazy("Onion")).toHaveAttribute("data-active-item");

  await press.ArrowDown();

  expect(q.option("Parsnip")).toHaveAttribute("data-active-item");
  expect(q.combobox("Vegetable")).toHaveFocus();
});
