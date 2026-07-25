import { click, hover, q, sleep } from "@ariakit/test";
import { expect, test, vi } from "vitest";

// Presenting the item spans a few frames, so it has to settle before asserting.
async function settle() {
  await sleep();
  await sleep();
  await sleep();
  await sleep();
}

// https://github.com/ariakit/ariakit/pull/6832
test("does not take focus when the popup starts open", async () => {
  await settle();

  expect(document.body).toHaveFocus();
  expect(q.combobox("Vegetable")).not.toHaveFocus();
});

test("does not scroll the list when hovering an item", async () => {
  using scrollIntoView = vi.spyOn(HTMLElement.prototype, "scrollIntoView");
  await click(q.combobox.ensure("Fruit"));
  await settle();
  scrollIntoView.mockClear();

  // Any item works here: happy-dom has no layout, so the assertion is that
  // nothing scrolled at all rather than that the position stayed put.
  await hover(q.option("Plum"));
  await settle();

  expect(q.option("Plum")).toHaveAttribute("data-active-item");
  expect(scrollIntoView).not.toHaveBeenCalled();
});

// https://github.com/ariakit/ariakit/pull/6832
test("keeps focus on the select when an input owns the composite", async () => {
  await click(q.combobox.ensure("Filtered fruit"));
  await settle();

  expect(q.combobox("Filtered fruit")).toHaveFocus();
  expect(q.combobox("Filter Filtered fruit")).not.toHaveFocus();
});
