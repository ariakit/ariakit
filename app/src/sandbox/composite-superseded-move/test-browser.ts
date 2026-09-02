import type { Page } from "@playwright/test";
import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  /**
   * Asks for a tool that has not loaded yet. The move counts as a request like
   * any other, but nothing can carry it out until the item registers.
   */
  const askForZoom = async (page: Page) => {
    const q = query(page);
    await q.button("Focus zoom tool").click();
    await test.expect(q.option("Zoom")).toBeHidden();
  };

  const handOffControl = (page: Page) =>
    query(page).checkbox("Hand off composite behavior");

  const handOff = async (page: Page) => {
    await handOffControl(page).click();
    await test.expect(handOffControl(page)).toBeChecked();
  };

  /**
   * Takes composite behavior back and settles the point where a focus request
   * would land.
   */
  const takeBackAndSettle = async (page: Page) => {
    await handOffControl(page).click();
    await test.expect(handOffControl(page)).not.toBeChecked();
    // Focus staying put has no positive state to wait on, and the effect that
    // would disturb it runs a commit after the palette is a composite again.
    await flushFrames(page);
  };

  // Pins the harness: with no move behind it, the `composite` prop switching
  // off and on moves nothing on its own.
  test("keeps focus when untouched composite behavior comes back", async ({
    page,
  }) => {
    await handOff(page);

    await takeBackAndSettle(page);

    await test.expect(handOffControl(page)).toBeFocused();
  });

  // Pins the other half: with nothing taking the request over, it stays pending
  // and the tool takes focus once it loads.
  test("focuses a tool that loads after being asked for", async ({
    page,
    q,
  }) => {
    await askForZoom(page);

    await q.button("Load zoom tool").click();

    await test.expect(q.option("Zoom")).toBeFocused();
  });

  // Pins the handoff on its own, so the test below cannot pass merely because
  // handing composite behavior over and back spends a pending request. It does
  // not: the request is still waiting, so it survives.
  test("focuses a tool that loads after composite behavior comes back", async ({
    page,
    q,
  }) => {
    await askForZoom(page);
    await handOff(page);
    await takeBackAndSettle(page);

    await q.button("Load zoom tool").click();

    await test.expect(q.option("Zoom")).toBeFocused();
  });

  // The palette taking focus replaces the pending request with its own, which
  // spends it. A spent request is not left behind for the next effect instance,
  // so taking composite behavior back moves nothing.
  // https://github.com/ariakit/ariakit/issues/7360
  test("keeps focus when composite behavior comes back after the palette took the request over", async ({
    page,
    q,
  }) => {
    await askForZoom(page);
    // Into the palette's own padding. A centred click would land on the tool
    // that sits there instead, and focus a tool rather than the palette.
    await q.listbox("Tools").click({ position: { x: 4, y: 4 } });
    await test.expect(q.listbox("Tools")).toBeFocused();

    await handOff(page);
    await takeBackAndSettle(page);

    await test.expect(handOffControl(page)).toBeFocused();
  });
});
