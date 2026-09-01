import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

/**
 * Asks for a tool that has not loaded yet. The move counts as a request like
 * any other, but nothing can carry it out until the item registers.
 */
async function askForZoom() {
  await click(q.button("Focus zoom tool"));
  expect(q.option.maybe("Zoom")).not.toBeInTheDocument();
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

// Pins the harness: with no move behind it, the `composite` prop switching off
// and on moves nothing on its own.
test("keeps focus when untouched composite behavior comes back", async () => {
  await handOff();

  await takeBack();

  expect(handOffControl()).toHaveFocus();
});

// Pins the other half: with nothing taking the request over, it stays pending
// and the tool takes focus once it loads.
test("focuses a tool that loads after being asked for", async () => {
  await askForZoom();

  await click(q.button("Load zoom tool"));

  expect(q.option("Zoom")).toHaveFocus();
});

// Pins the handoff on its own, so the test below cannot pass merely because
// handing composite behavior over and back spends a pending request. It does
// not: the request is still waiting, so it survives.
test("focuses a tool that loads after composite behavior comes back", async () => {
  await askForZoom();
  await handOff();
  await takeBack();

  await click(q.button("Load zoom tool"));

  expect(q.option("Zoom")).toHaveFocus();
});

// The palette taking focus replaces the pending request with its own, which
// spends it. A spent request is not left behind for the next effect instance,
// so taking composite behavior back moves nothing.
// https://github.com/ariakit/ariakit/issues/7360
test("keeps focus when composite behavior comes back after the palette took the request over", async () => {
  await askForZoom();
  await click(q.listbox("Tools"));
  expect(q.listbox("Tools")).toHaveFocus();

  await handOff();
  await takeBack();

  expect(handOffControl()).toHaveFocus();
});
