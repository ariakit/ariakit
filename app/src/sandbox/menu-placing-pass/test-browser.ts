import type { Page } from "@playwright/test";
import { flushFrames, withFramework } from "#app/test-utils/preview.ts";
import { recordScrollEvents } from "#app/test-utils/scroll.ts";

const replacementLastAction = "Action 30";

withFramework(import.meta.dirname, async ({ query, test }) => {
  type Query = ReturnType<typeof query>;

  const prepareReplacementFromInside = async (page: Page, q: Query) => {
    const menu = q.menu("Replacement actions");
    const withinMenu = query(menu);
    await q.button("Show Replacement actions").click();
    await test.expect(menu).toBeVisible();
    await test.expect(menu).toHaveAttribute("data-placing");

    await withinMenu.menuitem("Action 1").focus();
    await test.expect(withinMenu.menuitem("Action 1")).toBeFocused();
    await page.keyboard.press("End");

    const lastItem = withinMenu.menuitem(replacementLastAction);
    await test.expect(lastItem).toHaveAttribute("data-active-item");
    await test.expect(lastItem).toBeFocused();
    return { menu, lastItem, withinMenu };
  };

  const prepareReplacementFromOutside = async (q: Query) => {
    const menu = q.menu("Replacement actions");
    const withinMenu = query(menu);
    await q.button("Show Replacement actions").click();
    await test.expect(menu).toBeVisible();
    await test.expect(menu).toHaveAttribute("data-placing");

    const moveButton = q.button("Move to last Replacement actions action");
    // The menu is deliberately held in an unplaced position, where it can
    // cover this control. Establish outside focus directly, then invoke the
    // button without depending on pointer hit testing.
    await moveButton.focus();
    await test.expect(moveButton).toBeFocused();
    await moveButton.evaluate((element) => {
      if (element instanceof HTMLElement) element.click();
    });
    const lastItem = withinMenu.menuitem(replacementLastAction);
    await test.expect(lastItem).toHaveAttribute("data-active-item");
    await test.expect(lastItem).toBeFocused();
    return { menu, lastItem, withinMenu };
  };

  const replaceItemsWithoutMovingFocus = async (q: Query) => {
    await q.button("Replace Replacement actions items").evaluate((element) => {
      if (element instanceof HTMLElement) element.click();
    });
  };

  const finishReplacementWithoutMovingFocus = async (q: Query) => {
    await q
      .button("Finish Replacement actions positioning")
      .evaluate((element) => {
        // A real click would move focus before resolving the placement promise,
        // which is not part of the reported interaction.
        if (element instanceof HTMLElement) element.click();
      });
  };

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

  // https://github.com/ariakit/ariakit/issues/7042
  test("presents a focused item after its node is replaced", async ({
    page,
    q,
  }) => {
    const { menu, withinMenu } = await prepareReplacementFromInside(page, q);

    await replaceItemsWithoutMovingFocus(q);
    const replacement = withinMenu.menuitem(replacementLastAction);
    await test.expect(replacement).toHaveAttribute("data-active-item");
    await test.expect(replacement).toBeFocused();

    await finishReplacementWithoutMovingFocus(q);
    await test.expect(replacement).toBeFocused();
    await test.expect
      .poll(() => menu.evaluate((element) => element.scrollTop))
      .toBeGreaterThan(0);
  });

  // https://github.com/ariakit/ariakit/issues/7042
  test("restores focus after a move from outside replaces its item", async ({
    q,
  }) => {
    const { menu, withinMenu } = await prepareReplacementFromOutside(q);

    await replaceItemsWithoutMovingFocus(q);
    const replacement = withinMenu.menuitem(replacementLastAction);
    await test.expect(replacement).toHaveAttribute("data-active-item");
    await test.expect(replacement).toBeFocused();

    await finishReplacementWithoutMovingFocus(q);
    await test.expect(replacement).toBeFocused();
    await test.expect
      .poll(() => menu.evaluate((element) => element.scrollTop))
      .toBeGreaterThan(0);
  });

  // https://github.com/ariakit/ariakit/pull/7050
  test("cancels an unresolved presentation after focus leaves and returns", async ({
    q,
  }) => {
    const menu = q.menu("Replacement actions");
    const withinMenu = query(menu);
    await q.button("Show Replacement actions").click();
    await test.expect(menu).toHaveAttribute("data-placing");

    const firstItem = withinMenu.menuitem("Action 1");
    await firstItem.focus();
    await test.expect(firstItem).toBeFocused();
    await q
      .button("Move to pending Replacement actions action")
      .evaluate((element) => {
        if (element instanceof HTMLElement) element.click();
      });

    const escapeTarget = q.button("Actions");
    await escapeTarget.focus();
    await test.expect(escapeTarget).toBeFocused();
    const popupFocusTarget = q.button("Replacement actions popup focus target");
    await popupFocusTarget.evaluate((element) => {
      if (element instanceof HTMLElement) {
        element.focus({ preventScroll: true });
      }
    });
    await test.expect(popupFocusTarget).toBeFocused();

    await q
      .button("Show pending Replacement actions item")
      .evaluate((element) => {
        if (element instanceof HTMLElement) element.click();
      });
    const pendingItem = withinMenu.menuitem("Pending action");
    await test.expect(pendingItem).toHaveAttribute("data-active-item");
    await test.expect(popupFocusTarget).toBeFocused();

    await finishReplacementWithoutMovingFocus(q);
    await test.expect(menu).not.toHaveAttribute("data-placing");
    await test.expect(popupFocusTarget).toBeFocused();
    test.expect(await menu.evaluate((element) => element.scrollTop)).toBe(0);
  });

  // https://github.com/ariakit/ariakit/pull/7050
  test("does not revive a target after another focused item is removed", async ({
    page,
    q,
  }) => {
    const { menu, lastItem, withinMenu } =
      await prepareReplacementFromOutside(q);
    const transientItem = withinMenu.menuitem("Transient action");
    await transientItem.evaluate((element) => {
      if (element instanceof HTMLElement) {
        element.focus({ preventScroll: true });
      }
    });
    await test.expect(transientItem).toBeFocused();
    await test.expect(lastItem).toHaveAttribute("data-active-item");

    await q
      .button("Remove transient Replacement actions item")
      .evaluate((element) => {
        if (element instanceof HTMLElement) element.click();
      });
    await test.expect(page.locator("body")).toBeFocused();

    await replaceItemsWithoutMovingFocus(q);
    const replacement = withinMenu.menuitem(replacementLastAction);
    await test.expect(replacement).toHaveAttribute("data-active-item");
    await test.expect(page.locator("body")).toBeFocused();

    await finishReplacementWithoutMovingFocus(q);
    await test.expect(menu).not.toHaveAttribute("data-placing");
    await test.expect(page.locator("body")).toBeFocused();
    test.expect(await menu.evaluate((element) => element.scrollTop)).toBe(0);
  });

  // https://github.com/ariakit/ariakit/issues/7042
  test("does not scroll when a stopped blur leaves an outside replacement", async ({
    q,
  }) => {
    const { menu, withinMenu } = await prepareReplacementFromOutside(q);

    await replaceItemsWithoutMovingFocus(q);
    const replacement = withinMenu.menuitem(replacementLastAction);
    await test.expect(replacement).toHaveAttribute("data-active-item");
    await test.expect(replacement).toBeFocused();
    await replacement.evaluate((element) =>
      element.setAttribute("data-stop-blur-propagation", ""),
    );

    const escapeTarget = q.button("Actions");
    await escapeTarget.focus();
    await test.expect(escapeTarget).toBeFocused();

    await finishReplacementWithoutMovingFocus(q);
    await test.expect(menu).not.toHaveAttribute("data-placing");
    await test.expect(escapeTarget).toBeFocused();
    test.expect(await menu.evaluate((element) => element.scrollTop)).toBe(0);
  });

  // https://github.com/ariakit/ariakit/issues/7042
  test("does not restore focus when blur and replacement share a task", async ({
    page,
    q,
  }) => {
    const { menu, lastItem, withinMenu } =
      await prepareReplacementFromOutside(q);

    await lastItem.evaluate((element) => {
      if (!(element instanceof HTMLElement)) return;
      element.blur();
      document.getElementById("replace-replacement-actions-items")?.click();
    });

    const replacement = withinMenu.menuitem(replacementLastAction);
    await test.expect(replacement).toHaveAttribute("data-active-item");
    await test.expect(page.locator("body")).toBeFocused();

    await finishReplacementWithoutMovingFocus(q);
    await test.expect(menu).not.toHaveAttribute("data-placing");
    await test.expect(page.locator("body")).toBeFocused();
    test.expect(await menu.evaluate((element) => element.scrollTop)).toBe(0);
  });

  // https://github.com/ariakit/ariakit/issues/7042
  test("does not revive scrolling after a same-task focus escape", async ({
    q,
  }) => {
    const { menu, withinMenu } = await prepareReplacementFromOutside(q);

    await replaceItemsWithoutMovingFocus(q);
    const replacement = withinMenu.menuitem(replacementLastAction);
    await test.expect(replacement).toBeFocused();

    await replacement.evaluate(() => {
      const outside = document.getElementById(
        "replacement-actions-escape-target",
      );
      const inside = document.getElementById(
        "replacement-actions-popup-focus-target",
      );
      outside?.focus({ preventScroll: true });
      inside?.focus({ preventScroll: true });
    });
    const popupFocusTarget = q.button("Replacement actions popup focus target");
    await test.expect(popupFocusTarget).toBeFocused();

    await finishReplacementWithoutMovingFocus(q);
    await test.expect(menu).not.toHaveAttribute("data-placing");
    await test.expect(popupFocusTarget).toBeFocused();
    test.expect(await menu.evaluate((element) => element.scrollTop)).toBe(0);
  });

  // https://github.com/ariakit/ariakit/issues/7042
  test("does not revive scrolling when focus returns after escaping", async ({
    q,
  }) => {
    const { menu, withinMenu } = await prepareReplacementFromOutside(q);

    await replaceItemsWithoutMovingFocus(q);
    const replacement = withinMenu.menuitem(replacementLastAction);
    await test.expect(replacement).toHaveAttribute("data-active-item");
    await test.expect(replacement).toBeFocused();

    const escapeTarget = q.button("Actions");
    await escapeTarget.focus();
    await test.expect(escapeTarget).toBeFocused();
    await replacement.evaluate((element) => {
      if (element instanceof HTMLElement) {
        element.focus({ preventScroll: true });
      }
    });
    await test.expect(replacement).toBeFocused();

    await finishReplacementWithoutMovingFocus(q);
    await test.expect(menu).not.toHaveAttribute("data-placing");
    await test.expect(replacement).toBeFocused();
    test.expect(await menu.evaluate((element) => element.scrollTop)).toBe(0);
  });

  // https://github.com/ariakit/ariakit/issues/7042
  test("does not scroll after an outside move is blurred", async ({
    page,
    q,
  }) => {
    const { menu, lastItem, withinMenu } =
      await prepareReplacementFromOutside(q);

    await lastItem.evaluate((element) => {
      if (element instanceof HTMLElement) element.blur();
    });
    await test.expect(page.locator("body")).toBeFocused();

    await replaceItemsWithoutMovingFocus(q);
    const replacement = withinMenu.menuitem(replacementLastAction);
    await test.expect(replacement).toHaveAttribute("data-active-item");
    await test.expect(page.locator("body")).toBeFocused();

    await finishReplacementWithoutMovingFocus(q);
    await test.expect(menu).not.toHaveAttribute("data-placing");
    await test.expect(page.locator("body")).toBeFocused();
    test.expect(await menu.evaluate((element) => element.scrollTop)).toBe(0);
  });

  // https://github.com/ariakit/ariakit/issues/7042
  test("does not scroll after an outside move loses focus", async ({ q }) => {
    const { menu, withinMenu } = await prepareReplacementFromOutside(q);
    const escapeTarget = q.button("Actions");
    await escapeTarget.focus();
    await test.expect(escapeTarget).toBeFocused();

    await replaceItemsWithoutMovingFocus(q);
    const replacement = withinMenu.menuitem(replacementLastAction);
    await test.expect(replacement).toHaveAttribute("data-active-item");
    await test.expect(escapeTarget).toBeFocused();

    await finishReplacementWithoutMovingFocus(q);
    await test.expect(menu).not.toHaveAttribute("data-placing");
    await test.expect(escapeTarget).toBeFocused();
    test.expect(await menu.evaluate((element) => element.scrollTop)).toBe(0);
  });

  // https://github.com/ariakit/ariakit/issues/7042
  test("does not restore focus after the focused item is blurred", async ({
    page,
    q,
  }) => {
    const { menu, lastItem, withinMenu } = await prepareReplacementFromInside(
      page,
      q,
    );

    await lastItem.evaluate((element) => {
      if (element instanceof HTMLElement) element.blur();
    });
    await test.expect(page.locator("body")).toBeFocused();

    await replaceItemsWithoutMovingFocus(q);
    const replacement = withinMenu.menuitem(replacementLastAction);
    await test.expect(replacement).toHaveAttribute("data-active-item");
    await test.expect(page.locator("body")).toBeFocused();

    await finishReplacementWithoutMovingFocus(q);
    await test.expect(menu).not.toHaveAttribute("data-placing");
    await test.expect(page.locator("body")).toBeFocused();
    test.expect(await menu.evaluate((element) => element.scrollTop)).toBe(0);
  });

  // https://github.com/ariakit/ariakit/issues/7042
  test("does not restore focus after focus moves elsewhere", async ({
    page,
    q,
  }) => {
    const { menu, withinMenu } = await prepareReplacementFromInside(page, q);
    const escapeTarget = q.button("Actions");
    await escapeTarget.focus();
    await test.expect(escapeTarget).toBeFocused();

    await replaceItemsWithoutMovingFocus(q);
    const replacement = withinMenu.menuitem(replacementLastAction);
    await test.expect(replacement).toHaveAttribute("data-active-item");
    await test.expect(escapeTarget).toBeFocused();

    await finishReplacementWithoutMovingFocus(q);
    await test.expect(menu).not.toHaveAttribute("data-placing");
    await test.expect(escapeTarget).toBeFocused();
    test.expect(await menu.evaluate((element) => element.scrollTop)).toBe(0);
  });
});
