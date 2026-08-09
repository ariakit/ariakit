import { click, focus, press, q, sleep } from "@ariakit/test";
import { expect, test } from "vitest";

const labels = ["Fruit", "Fruit without virtual focus"];

for (const label of labels) {
  // https://github.com/ariakit/ariakit/issues/7093
  test(`${label}: a collapsed select never focuses its list`, async () => {
    const select = q.combobox.ensure(label);
    const list = q.listbox(`${label} options`);
    const focusedOptions = q.status(`${label} focused options`);

    await focus(select);

    expect(select).toHaveAttribute("aria-expanded", "false");
    // The composite can present its active item from a queued microtask or
    // from a passive effect, and `focus` only flushes microtasks. Cross a
    // macrotask so a presentation has a chance to run before asserting that
    // nothing focused an item.
    await sleep();
    expect(select).toHaveFocus();
    expect(focusedOptions).toHaveTextContent(/^none$/);

    await press("g", select);

    expect(select).toHaveTextContent("Grape");
    expect(q.within(list).option("Grape")).toHaveAttribute("data-active-item");
    expect(select).toHaveFocus();
    expect(select).toHaveAttribute("aria-expanded", "false");
    expect(focusedOptions).toHaveTextContent(/^none$/);

    // Opening the list is what turns its items into focus targets, so this
    // also shows that the recorder fires when an item really is focused.
    await press("ArrowDown", select);

    expect(select).toHaveAttribute("aria-expanded", "true");
    expect(q.within(list).option("Grape")).toHaveAttribute("data-active-item");
    expect(focusedOptions).toHaveTextContent(/^Grape$/);
  });
}

// https://github.com/ariakit/ariakit/issues/7093
// Only virtual focus asks for the active item when the select itself is
// focused, which happens while the list is still closed. That request is the
// one that has to survive until the list opens, so a pointer open with no move
// before it still presents the item.
test("opening the collapsed select with a pointer presents its item", async () => {
  const select = q.combobox.ensure("Fruit");

  await click(select);

  expect(select).toHaveAttribute("aria-expanded", "true");
  expect(q.status("Fruit focused options")).toHaveTextContent(/^Apple$/);
});

// https://github.com/ariakit/ariakit/issues/7093
// Focusing the collapsed select leaves a presentation waiting for the list to
// open. Picking another option before that happens has to retire it, or
// opening the list would present the option that was active on focus.
test("picking an option before opening retires the pending presentation", async () => {
  const select = q.combobox.ensure("Code");
  await focus(select);
  await click(q.option("Alpha 25"));
  expect(select).toHaveTextContent("Alpha 25");

  await click(select);

  expect(select).toHaveAttribute("aria-expanded", "true");
  expect(q.option("Alpha 25")).toHaveAttribute("data-active-item");
});

// https://github.com/ariakit/ariakit/pull/7098#discussion_r3742291859
// Withholding belongs to the widget that owns focus. A move made from outside
// keeps presenting immediately, so the focus it moves is attributable to that
// call instead of landing on whoever is focused when the list next opens.
test("a move from outside the widget still presents immediately", async () => {
  const openList = q.button("Open stage list");

  await click(q.button("Apply stage preset"));

  expect(q.option("Final")).toHaveFocus();
  expect(q.combobox("Stage")).toHaveAttribute("aria-expanded", "false");

  await click(openList);

  expect(q.combobox("Stage")).toHaveAttribute("aria-expanded", "true");
  expect(openList).toHaveFocus();
});

// https://github.com/ariakit/ariakit/pull/7098#discussion_r3742291859
// Once focus is on an option, moving between options is navigation inside the
// list, not focus leaving the control, so the focus ring has to keep up with
// the active item even though the list is collapsed.
test("arrow keys keep moving focus between options in a collapsed list", async () => {
  const list = q.listbox("Stage options");
  const draft = q.within(list).option("Draft");
  await click(draft);
  expect(draft).toHaveFocus();
  expect(q.combobox("Stage")).toHaveAttribute("aria-expanded", "false");

  await press.ArrowDown();

  const review = q.within(list).option("Review");
  expect(review).toHaveAttribute("data-active-item");
  expect(review).toHaveFocus();
});

// https://github.com/ariakit/ariakit/issues/7093
test("a collapsed combobox input never focuses its list", async () => {
  const combobox = q.combobox.ensure("Filter");

  await focus(combobox);
  // The presentation is queued in a microtask, so cross a macrotask before
  // asserting that nothing focused an item.
  await sleep();

  expect(combobox).toHaveFocus();
  expect(combobox).toHaveAttribute("aria-expanded", "false");
  expect(q.status("Filter focused options")).toHaveTextContent(/^none$/);
});
