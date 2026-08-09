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
