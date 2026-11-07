import type { query } from "@ariakit/test/playwright";
import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { isPreviewHydrated } from "#app/lib/preview-hydration.ts";
import { withFramework } from "#app/test-utils/preview.ts";

type Query = ReturnType<typeof query>;

// The fades are opacity transitions, so the tests count the ones that start in
// the region. The count lives on the root element, so a script added before the
// page loads can also record the transitions of the server HTML.
const COUNT_ATTRIBUTE = "data-test-opacity-transitions";

function countOpacityTransitions(attribute: string) {
  let count = 0;
  // A script added before the page loads can run before the root element
  // exists, so the count is written once the root is there.
  const writeCount = () => {
    document.documentElement?.setAttribute(attribute, String(count));
  };
  document.addEventListener("transitionrun", (event) => {
    if (event.propertyName !== "opacity") return;
    if (!(event.target instanceof Element)) return;
    if (!event.target.closest("[aria-label='People']")) return;
    count += 1;
    writeCount();
  });
  if (document.documentElement) {
    writeCount();
    return;
  }
  document.addEventListener("DOMContentLoaded", writeCount);
}

async function getOpacityTransitionCount(page: Page) {
  const count = await page.locator("html").getAttribute(COUNT_ATTRIBUTE);
  // A missing count means that the counter never ran, not that no transition
  // ran.
  if (count == null) {
    throw new Error("The opacity transition counter is not installed");
  }
  return Number(count);
}

// The simulated request stays pending until the test unchecks "Keep loading",
// so the assertions don't race its latency on a slow runner.
async function reloadAndKeepLoading(q: Query) {
  await q.checkbox("Keep loading").check();
  await q.button("Reload").click();
  await expect(q.region("People")).toHaveAttribute("aria-busy", "true");
}

withFramework(import.meta.dirname, async ({ framework, id, test }) => {
  test("paints the first placeholders without a fade", async ({ page, q }) => {
    // The paused clock keeps the first request pending, so the placeholders
    // never fade out during the test.
    await page.clock.install();
    await page.clock.pauseAt(Date.now() + 1000);
    await page.addInitScript(countOpacityTransitions, COUNT_ATTRIBUTE);
    await page.goto(`/${framework}/previews/${id}/`);
    await page.waitForFunction(isPreviewHydrated);
    await test.expect(q.region("People")).toHaveAttribute("aria-busy", "true");
    // The placeholders are hidden from assistive technologies, and only the
    // pending marker tells whether they are painted.
    await test.expect(page.locator("[data-pending]")).toHaveCount(0);
    test.expect(await getOpacityTransitionCount(page)).toBe(0);
  });

  test("fades in the placeholders that replace loaded content", async ({
    page,
    q,
  }) => {
    await test.expect(q.text("Person 1")).toBeVisible();
    await page.evaluate(countOpacityTransitions, COUNT_ATTRIBUTE);
    await reloadAndKeepLoading(q);
    await test.expect(q.text("Person 1")).toBeHidden();
    await test.expect
      .poll(() => getOpacityTransitionCount(page))
      .toBeGreaterThan(0);
  });

  test("fades out the placeholders before it shows the content", async ({
    page,
    q,
  }) => {
    await test.expect(q.text("Person 1")).toBeVisible();
    await page.evaluate(countOpacityTransitions, COUNT_ATTRIBUTE);
    await reloadAndKeepLoading(q);
    // The placeholders fade in first. Once that fade starts and ends, the
    // fade-out below is the only opacity transition that runs.
    await test.expect
      .poll(() => getOpacityTransitionCount(page))
      .toBeGreaterThan(0);
    await test.expect
      .poll(() =>
        page.evaluate(() =>
          document
            .getAnimations()
            .some((animation) => animation instanceof CSSTransition),
        ),
      )
      .toBe(false);
    await q.checkbox("Keep loading").uncheck();
    // Holds the fade-out where it starts, so the test can check that the
    // content waits for it.
    const fadeOut = await page.waitForFunction(
      () => {
        const region = document.querySelector("[aria-label='People']");
        if (!region) return null;
        const transitions = region
          .getAnimations({ subtree: true })
          .filter(
            (animation) =>
              animation instanceof CSSTransition &&
              animation.transitionProperty === "opacity",
          );
        for (const transition of transitions) {
          transition.pause();
        }
        return transitions.length ? transitions : null;
      },
      undefined,
      // The request ends 2 seconds after "Keep loading" turns off.
      { timeout: 5000 },
    );
    await test.expect(q.region("People")).toHaveAttribute("aria-busy", "false");
    // The content can only show after the paused fade-out ends, so no state can
    // change after this point until the fade-out finishes.
    await test.expect(q.text("Person 1")).toBeHidden();
    await fadeOut.evaluate((transitions) => {
      if (!transitions) return;
      for (const transition of transitions) {
        transition.finish();
      }
    });
    await test.expect(q.text("Person 1")).toBeVisible();
  });

  test("shows and removes the placeholders at once with reduced motion", async ({
    page,
    q,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await test.expect(q.text("Person 1")).toBeVisible();
    await page.evaluate(countOpacityTransitions, COUNT_ATTRIBUTE);
    await q.button("Reload").click();
    await test.expect(q.text("Person 1")).toBeHidden();
    // Checks every frame until the content shows. Without a fade, the content
    // must replace the placeholders before a frame paints them hidden. The
    // leave marker is the only sign of that state, because hidden placeholders
    // and blank space look the same.
    const blankFrame = await page.evaluateHandle(() => {
      const result = { painted: false };
      const check = () => {
        if (document.querySelector("[data-leave]")) {
          result.painted = true;
        }
        requestAnimationFrame(check);
      };
      requestAnimationFrame(check);
      return result;
    });
    // The request takes 2 seconds.
    await test.expect(q.text("Person 1")).toBeVisible({ timeout: 5000 });
    test
      .expect(await blankFrame.evaluate(({ painted }) => painted))
      .toBe(false);
    test.expect(await getOpacityTransitionCount(page)).toBe(0);
  });
});
