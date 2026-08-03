import { flushFrames, withFramework } from "#app/test-utils/preview.ts";
import { recordScrollEvents } from "#app/test-utils/scroll.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // A custom `updatePosition` that calls the supplied default and then keeps
  // working owns the whole pass: the popup is only where it belongs once that
  // callback returns. Publishing readiness when the inner default pass resolves
  // lets a pending presentation scroll the page to an intermediate position.
  // `data-placing` is pinned alongside the scroll because it is the state the
  // presentation waits on, so a green scroll assertion would otherwise not
  // distinguish "waited" from "had nothing to do".
  // https://github.com/ariakit/ariakit/issues/7019
  test("keeps the popup unplaced while a custom updatePosition is still working", async ({
    page,
    q,
  }) => {
    const menu = q.menu("Actions");
    const firstItem = q.menuitem("Action 1");
    const lastItem = q.menuitem("Action 30");

    await page.evaluate(() => window.scrollTo({ top: 700 }));
    await test.expect.poll(() => page.evaluate(() => window.scrollY)).toBe(700);

    await q.button("Actions").click();
    await test.expect(menu).toBeVisible();
    // The default pass has written a transform by now, which is what brings the
    // menu under its button, so the callback is the only thing left to wait for.
    await test.expect(firstItem).toBeInViewport();
    // A popup that isn't placed doesn't take its initial focus, so focus
    // staying on the button is the user-facing half of the state the attribute
    // mirrors.
    await test.expect(q.button("Actions")).toBeFocused();
    await test.expect(menu).toHaveAttribute("data-placing");
    await test.expect(lastItem).not.toBeInViewport();

    const scroll = await recordScrollEvents(page);
    await q.button("Move to last Actions action").click();
    await test.expect(lastItem).toHaveAttribute("data-active-item");

    // There is no positive state for a presentation that is waiting, so wait
    // through the checkpoint where its scroll would have landed.
    await flushFrames(page);
    await test.expect(lastItem).not.toBeInViewport();
    test.expect(await scroll.events()).not.toContain("document");

    // The scroll the presentation held back lands once the pass is over. This
    // proves that half was deferred rather than dropped; it does not tell the
    // two worlds apart, because the unfixed one reaches the same offset
    // earlier, which is what the assertions before the release cover.
    await q.button("Finish Actions positioning").click();
    await test.expect(menu).not.toHaveAttribute("data-placing");
    await test.expect(lastItem).toBeInViewport();
  });

  // A pass that fails has still ended, and when the supplied default already
  // wrote a position the popup is somewhere real. Leaving it marked unplaced
  // strands everything waiting on it: the items keep taking focus but the page
  // never follows, so navigating past the fold walks focus onto items the user
  // cannot see.
  // Browser-only: the popover hands `update` to `autoUpdate`, which never
  // awaits it, so a rejecting callback also surfaces as an unhandled rejection.
  // Vitest fails a run on that regardless of what the page does with it, and
  // the popover rethrows on purpose.
  // https://github.com/ariakit/ariakit/pull/7032#discussion_r3702887246
  test("publishes the popup as placed when a custom updatePosition fails after positioning it", async ({
    page,
    q,
  }) => {
    const menu = q.menu("Actions");
    const firstItem = q.menuitem("Action 1");
    const lastItem = q.menuitem("Action 30");

    await page.evaluate(() => window.scrollTo({ top: 700 }));
    await test.expect.poll(() => page.evaluate(() => window.scrollY)).toBe(700);

    await q.button("Actions").click();
    await test.expect(menu).toBeVisible();
    await test.expect(firstItem).toBeInViewport();
    await test.expect(menu).toHaveAttribute("data-placing");

    await q.button("Move to last Actions action").click();
    await test.expect(lastItem).toHaveAttribute("data-active-item");
    // Same checkpoint as the first test: a presentation that is waiting has no
    // positive state, so wait through where its scroll would have landed.
    await flushFrames(page);
    await test.expect(lastItem).not.toBeInViewport();

    await q.button("Fail Actions positioning").click();
    await test.expect(menu).not.toHaveAttribute("data-placing");
    await test.expect(lastItem).toBeInViewport();
  });

  // The other half of the same rule, and the only thing separating it from
  // clearing the state on any failure: a pass that fails before it positions
  // anything has nothing to move focus or scroll to, so the popup keeps
  // waiting.
  // https://github.com/ariakit/ariakit/pull/7032#discussion_r3702887246
  test("keeps the popup unplaced when a custom updatePosition fails before positioning it", async ({
    page,
    q,
  }) => {
    const menu = q.menu("Actions");

    await q.button("Skip Actions positioning").click();
    await q.button("Actions").click();
    await test.expect(menu).toBeVisible();
    await test.expect(menu).toHaveAttribute("data-placing");

    await q.button("Fail Actions positioning").click();
    // Staying unplaced has no positive state, so wait through the checkpoint
    // where the release would have landed.
    await flushFrames(page);
    await test.expect(menu).toHaveAttribute("data-placing");
    await test.expect(menu).not.toBeFocused();
  });

  // Re-anchoring an open popup starts a new positioning pass, and the popup is
  // no more placed during that pass than it was during the first one. A
  // presentation that runs anyway acts on the position the popup is leaving.
  // Browser-only: an already open popup has no initial focus left to take, and
  // the focus half of a presentation never waits on placement, so the document
  // scroll is the only user-facing difference here and happy-dom cannot model
  // it because it stubs `scrollIntoView`.
  // https://github.com/ariakit/ariakit/issues/7019
  test("keeps the popup unplaced while an open popup repositions itself", async ({
    page,
    q,
  }) => {
    const menu = q.menu("Actions");
    const firstItem = q.menuitem("Action 1");
    const lastItem = q.menuitem("Action 30");

    await page.evaluate(() => window.scrollTo({ top: 700 }));
    await test.expect.poll(() => page.evaluate(() => window.scrollY)).toBe(700);

    await q.button("Actions").click();
    await test.expect(menu).toBeVisible();
    await q.button("Finish Actions positioning").click();
    await test.expect(menu).not.toHaveAttribute("data-placing");
    // Focus is on the button that finished the pass, so the popup taking its
    // show autofocus here is the one place in the suite that separates holding
    // that half back from removing it.
    await test.expect(menu).toBeFocused();
    await test.expect(firstItem).toBeInViewport();
    await test.expect(lastItem).not.toBeInViewport();

    await q.button("Reposition Actions").click();
    await test.expect(menu).toHaveAttribute("data-placing");

    const scroll = await recordScrollEvents(page);
    await q.button("Move to last Actions action").click();
    await test.expect(lastItem).toHaveAttribute("data-active-item");

    // Same checkpoint as the first test: a presentation that is waiting has no
    // positive state, so wait through where its scroll would have landed.
    await flushFrames(page);
    await test.expect(lastItem).not.toBeInViewport();
    test.expect(await scroll.events()).not.toContain("document");

    // The scroll the presentation held back lands once the pass is over. This
    // proves that half was deferred rather than dropped; it does not tell the
    // two worlds apart, because the unfixed one reaches the same offset
    // earlier, which is what the assertions before the release cover.
    await q.button("Finish Actions positioning").click();
    await test.expect(menu).not.toHaveAttribute("data-placing");
    await test.expect(lastItem).toBeInViewport();
  });

  // A popup that mounts only once its store is already open has no `Popover`
  // mounted to publish the show transition, so it starts out looking placed.
  // Focus must still stay out until its pass finishes.
  // https://github.com/ariakit/ariakit/pull/7032#discussion_r3703769238
  test("keeps focus out of a popup that mounts after its store is open", async ({
    q,
  }) => {
    const menu = q.menu("Late actions");
    const trigger = q.button("Late actions");

    await trigger.click();
    await test.expect(menu).toBeVisible();
    await test.expect(menu).toHaveAttribute("data-placing");
    await test.expect(trigger).toBeFocused();

    await q.button("Finish Late actions positioning").click();
    await test.expect(menu).not.toHaveAttribute("data-placing");
    await test.expect(menu).toBeFocused();
  });
});
