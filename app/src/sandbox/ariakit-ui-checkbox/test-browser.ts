import type { Locator } from "@playwright/test";
import {
  captureInView,
  capturePage,
  expectFocusVisible,
  forEachColorScheme,
  forEachColorSchemeOf,
  getBadgeHeight,
  getCapsOffset,
  tabTo,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";

// Toggles in the page and reads the transitions of the card's check in the same
// task, because a slower round trip could outlast them.
function toggleAndGetTransitions(checkbox: Locator) {
  return checkbox.evaluate((input: HTMLInputElement) => {
    input.click();
    const check = input.closest("label")?.querySelector(".choice-card-check");
    const animations = check?.getAnimations({ subtree: true }) ?? [];
    const transitions = animations.flatMap((animation) => {
      if (!(animation instanceof CSSTransition)) return [];
      const effect = animation.effect;
      if (!(effect instanceof KeyframeEffect)) return [];
      const { delay, duration } = effect.getComputedTiming();
      const clipPaths = effect.getKeyframes().map((frame) => frame.clipPath);
      const transition = { delay, duration, clipPaths };
      return [[animation.transitionProperty, transition] as const];
    });
    return Object.fromEntries(transitions);
  });
}

function getCheckEasing(checkbox: Locator) {
  return checkbox.evaluate((input: HTMLInputElement) => {
    const check = input.closest("label")?.querySelector(".choice-card-check");
    return check ? getComputedStyle(check).transitionTimingFunction : null;
  });
}

withCaptures(import.meta.dirname, async ({ query, test }) => {
  test("draws the check without a delay and removes it at once", async ({
    q,
  }) => {
    const box = query(q.article("Filter chips"));
    const checkbox = box.checkbox("Docs");
    await test.expect(checkbox).not.toBeChecked();

    const on = await toggleAndGetTransitions(checkbox);
    test.expect(Object.keys(on)).toEqual(["clip-path"]);
    const mark = on["clip-path"];
    test.expect(mark?.delay).toBe(0);
    test.expect(mark?.duration).toBeGreaterThan(0);
    // The mark reveals from its left edge, where the check's line starts.
    test
      .expect(mark?.clipPaths)
      .toEqual(["inset(0px 100% 0px 0px)", "inset(0px)"]);

    // A chip checked from the start has a settled mark. The mark of the chip
    // above hasn't moved yet, so unchecking it couldn't show a transition.
    const settled = box.checkbox("Design");
    await test.expect(settled).toBeChecked();
    test.expect(await toggleAndGetTransitions(settled)).toEqual({});
  });

  test("toggles a card without motion when the user prefers reduced motion", async ({
    page,
    q,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const checkbox = query(q.article("Filter chips")).checkbox("Docs");
    await test.expect(checkbox).not.toBeChecked();
    test.expect(await toggleAndGetTransitions(checkbox)).toEqual({});

    const floating = query(q.article("Floating check"));
    const unchecked = floating.checkbox("Alerts");
    await test.expect(unchecked).not.toBeChecked();
    test.expect(await toggleAndGetTransitions(unchecked)).toEqual({});
    const checked = floating.checkbox("Analytics");
    await test.expect(checked).toBeChecked();
    test.expect(await toggleAndGetTransitions(checked)).toEqual({});
  });

  test("scales a floating check in and out with its mark", async ({ q }) => {
    const box = query(q.article("Floating check"));
    const unchecked = box.checkbox("Alerts");
    await test.expect(unchecked).not.toBeChecked();
    const on = await toggleAndGetTransitions(unchecked);
    test.expect(on["clip-path"]?.delay).toBe(100);
    test.expect(on["background-color"]).toBeUndefined();
    // Engines report a transition's timing function in different places, but
    // they agree on the computed value.
    test.expect(await getCheckEasing(unchecked)).toMatch(/^linear\(/);

    // A card checked from the start has a settled check. The check of the card
    // above is still growing, so unchecking it would reverse a shorter run.
    const checked = box.checkbox("Analytics");
    await test.expect(checked).toBeChecked();
    const off = await toggleAndGetTransitions(checked);
    const duration = off.scale?.duration;
    test.expect(duration).toBeGreaterThan(0);
    test.expect(on.scale?.duration).toBeGreaterThan(Number(duration));
    // The check keeps its fill and mark until it has shrunk.
    test.expect(off["background-color"]?.duration).toBe(duration);
    test.expect(off.color?.duration).toBe(duration);
    test.expect(off["clip-path"]?.delay).toBe(duration);
    // Only the scale eases. The colors hold, then change at the end.
    test
      .expect(await getCheckEasing(checked))
      .toMatch(/^cubic-bezier\(0\.4, 0, 0\.2, 1\)(, steps\(1\)){2}$/);
  });

  test("keeps the dash of a mixed floating check while it shrinks", async ({
    q,
  }) => {
    const checkbox = query(q.article("Floating check")).checkbox("Analytics");
    await test.expect(checkbox).toBeChecked();
    const masks = await checkbox.evaluate((input: HTMLInputElement) => {
      const check = input.closest("label")?.querySelector(".choice-card-check");
      if (!check) return null;
      input.indeterminate = true;
      // Reading the mask also flushes the style, so that the click below starts
      // from the mixed state.
      const mixed = getComputedStyle(check, "::after").maskImage;
      // Clicking a checked and indeterminate input unchecks it.
      input.click();
      return { mixed, shrinking: getComputedStyle(check, "::after").maskImage };
    });
    test.expect(masks?.mixed).toContain("M5 12h14");
    test.expect(masks?.shrinking).toBe(masks?.mixed);
  });

  test("moves the thumb of a card's switch both ways", async ({ q }) => {
    const checkbox = query(q.article("Switch cards")).switch("Off");
    await test.expect(checkbox).not.toBeChecked();
    const on = await toggleAndGetTransitions(checkbox);
    test.expect(on.translate?.duration).toBeGreaterThan(0);
    test.expect(on.scale?.duration).toBeGreaterThan(0);
    const off = await toggleAndGetTransitions(checkbox);
    test.expect(off.translate?.duration).toBeGreaterThan(0);
  });

  test("keeps the card's switch mark when a check gets an undefined mark", async ({
    q,
  }) => {
    const checkbox = query(q.article("Switch cards")).switch("Optional props");
    await test.expect(checkbox).not.toBeChecked();
    const on = await toggleAndGetTransitions(checkbox);
    test.expect(on.translate?.duration).toBeGreaterThan(0);
  });

  test("moves the thumb of a switch without motion when the user prefers reduced motion", async ({
    page,
    q,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const checkbox = query(q.article("Switch cards")).switch("Off");
    await test.expect(checkbox).not.toBeChecked();
    test.expect(await toggleAndGetTransitions(checkbox)).toEqual({});
  });

  // A tile's top row is as tall as its largest slot. A badge beside that slot
  // keeps the height it has in the tile's content, with its text centered.
  // https://github.com/ariakit/ariakit/issues/7599
  test("keeps a badge in a tile's top row at its own height", async ({ q }) => {
    const plans = query(q.group("Plans"));
    const popular = plans.text("Popular");
    const recommended = plans.text("Recommended");
    await test.expect(popular).toBeVisible();
    test
      .expect(await getBadgeHeight(popular))
      .toBe(await getBadgeHeight(recommended));
    test.expect(await getCapsOffset(popular)).toBeCloseTo(0, 1);
  });

  test("page @visual", async ({ page, visual }) => {
    await forEachColorScheme(page, (colorScheme) =>
      capturePage({
        page,
        visual,
        colorScheme,
        item: "ariakit-ui-checkbox/page",
      }),
    );
  });

  test("draws the ring of a focused field on its box @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorSchemeOf(
      page,
      ["Checkbox field"],
      async (colorScheme) => {
        const box = q.article("Checkbox field");
        const input = query(box).checkbox("Remember me");
        await tabTo(page, input);
        await expectFocusVisible(input);
        await captureInView({
          visual,
          box,
          colorScheme,
          item: "ariakit-ui-checkbox/focused-field-ring",
        });
      },
    );
  });
});
