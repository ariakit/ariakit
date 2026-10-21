import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

function getShimmerDirections(page: Page) {
  return page.evaluate(() =>
    document.getAnimations().flatMap((animation) => {
      if (!(animation instanceof CSSAnimation)) return [];
      if (animation.animationName !== "ui-skeleton-shimmer") return [];
      const effect = animation.effect;
      if (!(effect instanceof KeyframeEffect)) return [];
      if (!effect.target) return [];
      const style = getComputedStyle(effect.target, effect.pseudoElement);
      return [style.animationDirection];
    }),
  );
}

// The tests must finish while the simulated request is pending, so polls use a
// short interval instead of the default backoff.
const pollOptions = { intervals: [50] };

// The region turns busy as soon as loading starts, but the parts stay pending
// until a timer shows the placeholders, so the shimmer starts slightly later.
async function expectShimmer(page: Page) {
  await expect
    .poll(async () => (await getShimmerDirections(page)).length, pollOptions)
    .toBeGreaterThan(0);
}

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/8015
  test("runs the shimmer without main-thread style work", async ({
    page,
    q,
  }) => {
    const people = q.region("People");
    // The session is ready before the reload, so the placeholders stay for the
    // whole measurement window.
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Performance.enable");
    const getRecalcStyleCount = async () => {
      const { metrics } = await cdp.send("Performance.getMetrics");
      const metric = metrics.find(({ name }) => name === "RecalcStyleCount");
      return metric?.value ?? 0;
    };

    await test.expect(q.text("Person 1")).toBeVisible();
    await q.button("Reload").click();
    await test.expect(people).toHaveAttribute("aria-busy", "true");
    await expectShimmer(page);
    // The fade-in transitions update styles on the main thread, so the
    // measurement starts after they end.
    await test.expect
      .poll(
        () =>
          page.evaluate(() =>
            document
              .getAnimations()
              .some((animation) => animation instanceof CSSTransition),
          ),
        pollOptions,
      )
      .toBe(false);

    const countBefore = await getRecalcStyleCount();
    // No page state tracks animation frames. A shimmer that runs on the main
    // thread recalculates styles on every frame, about 30 times in this window.
    await page.waitForTimeout(500);
    const countAfter = await getRecalcStyleCount();

    // The placeholders were still shown for the whole window.
    await test.expect(people).toHaveAttribute("aria-busy", "true");
    test.expect(countAfter - countBefore).toBeLessThan(5);
  });

  // https://github.com/ariakit/ariakit/issues/8015
  test("reverses the shimmer in right-to-left documents", async ({
    page,
    q,
  }) => {
    await test.expect(q.text("Person 1")).toBeVisible();
    // Sets the direction the way a right-to-left app would.
    await page.evaluate(() => {
      document.documentElement.dir = "rtl";
    });
    await q.button("Reload").click();
    await test.expect(q.region("People")).toHaveAttribute("aria-busy", "true");
    await expectShimmer(page);
    // Every part moves the highlight from the start edge, so all of them run
    // the animation in reverse.
    const directions = await getShimmerDirections(page);
    test.expect(new Set(directions)).toEqual(new Set(["reverse"]));
  });

  // https://github.com/ariakit/ariakit/issues/8015
  test("keeps the shimmer in step in a nested direction", async ({
    page,
    q,
  }) => {
    const people = q.region("People");
    await test.expect(q.text("Person 1")).toBeVisible();
    // Sets the directions the way a right-to-left app would when it embeds
    // left-to-right content.
    await page.evaluate(() => {
      document.documentElement.dir = "rtl";
    });
    await people.evaluate((element) => {
      element.setAttribute("dir", "ltr");
    });
    await q.button("Reload").click();
    await test.expect(people).toHaveAttribute("aria-busy", "true");
    await expectShimmer(page);
    const directions = await getShimmerDirections(page);
    test.expect(new Set(directions).size).toBe(1);
  });
});
