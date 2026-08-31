import { click, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

// `test-browser.ts` is authoritative for the page movement that the replayed
// focus request causes. happy-dom has no layout, so only the focus half is
// observable here.

/**
 * Moves the active item with the keyboard. The move is what arms the replay: it
 * leaves a move count behind that a fresh effect instance reads as a focus
 * request to carry out when the toolbar comes back, whether it comes back by
 * mounting again or by becoming a composite again.
 */
async function moveToSecondItem() {
  await click(q.button("Bold"));
  await press.ArrowRight();
  expect(q.button("Italic")).toHaveFocus();
}

async function collapse() {
  await click(q.button("Collapse toolbar"));
  expect(q.toolbar.maybe("Formatting")).not.toBeInTheDocument();
}

async function expand() {
  await click(q.button("Expand toolbar"));
  expect(q.toolbar("Formatting")).toBeInTheDocument();
}

function handOffControl() {
  return q.checkbox("Hand off composite behavior");
}

async function handOff() {
  await click(handOffControl());
  expect(handOffControl()).toBeChecked();
}

async function takeBack() {
  await click(handOffControl());
  expect(handOffControl()).not.toBeChecked();
}

// Pins the harness: with no move behind it, nothing in the library asks for
// focus here.
test("keeps focus when an untouched toolbar comes back", async () => {
  await collapse();

  await expand();

  expect(q.button("Collapse toolbar")).toHaveFocus();
});

// https://github.com/ariakit/ariakit/issues/7360
test("keeps focus when the toolbar comes back after a move", async () => {
  await moveToSecondItem();
  await collapse();

  await expand();

  expect(q.button("Collapse toolbar")).toHaveFocus();
});

// https://github.com/ariakit/ariakit/issues/7360
test("keeps focus through repeated remounts", async () => {
  await moveToSecondItem();
  await collapse();

  for (let cycle = 0; cycle < 3; cycle += 1) {
    await expand();
    expect(q.button("Collapse toolbar")).toHaveFocus();
    await collapse();
  }

  expect(q.button("Expand toolbar")).toHaveFocus();
});

// The same pin as the control above, for the other way the toolbar comes back.
test("keeps focus when untouched composite behavior comes back", async () => {
  await handOff();

  await takeBack();

  expect(handOffControl()).toHaveFocus();
});

// The sibling request: with an item still active, what gets replayed presents
// that item instead of the toolbar container. Handing composite behavior over
// and taking it back remounts the effect without replacing the toolbar element,
// so this also covers a remount the element itself survives.
// https://github.com/ariakit/ariakit/issues/7360
test("keeps focus when composite behavior comes back", async () => {
  await moveToSecondItem();
  await handOff();

  await takeBack();

  expect(handOffControl()).toHaveFocus();
});

// The other half of that branch: a move recorded while composite behavior is
// handed off has nothing to carry it out, so it stays pending and its item
// takes focus once the toolbar is a composite again. The move comes from the
// arrow key, which still moves the active item meanwhile; only focus stops
// following it.
// https://github.com/ariakit/ariakit/issues/7363
test("focuses a newly moved item when composite behavior comes back", async () => {
  await moveToSecondItem();
  await handOff();

  await click(q.button("Italic"));
  await press.ArrowRight();
  await takeBack();

  expect(q.button("Underline")).toHaveFocus();
});

test("focuses the toolbar when a focus command runs while it is expanded", async () => {
  await click(q.button("Focus toolbar"));

  expect(q.toolbar("Formatting")).toHaveFocus();
});

// A move that arrives with no composite element to carry it out stays pending,
// so the toolbar takes focus once it is back.
test("focuses the toolbar when a focus command runs while it is collapsed", async () => {
  await moveToSecondItem();
  await collapse();

  await click(q.button("Focus toolbar"));
  await expand();

  expect(q.toolbar("Formatting")).toHaveFocus();
});

// The same pending move, but with the toolbar mounted the whole time and only
// its `composite` prop switching off and back on.
test("focuses the toolbar when a focus command runs while it is handed off", async () => {
  await handOff();

  await click(q.button("Focus toolbar"));
  await takeBack();

  expect(q.toolbar("Formatting")).toHaveFocus();
});
