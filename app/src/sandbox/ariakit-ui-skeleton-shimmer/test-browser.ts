import type { query } from "@ariakit/test/playwright";
import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { isPreviewHydrated } from "#app/lib/preview-hydration.ts";
import { withFramework } from "#app/test-utils/preview.ts";

type Query = ReturnType<typeof query>;

// The simulated request takes 2 seconds.
const LATENCY = 2000;

// The fade is a CSS animation, and no other page state tells whether the
// content fades in.
function getAnimationName(q: Query, text: string) {
  return q
    .text(text)
    .evaluate((element) => getComputedStyle(element).animationName);
}

// Reloads the people and ends the request with the paused clock. The next rows
// of the reveal wait for timers that the paused clock holds, so the test can
// check the first row before they show.
async function reloadAndLoad(page: Page, q: Query) {
  const people = q.region("People");
  await q.button("Reload").click();
  await expect(people).toHaveAttribute("aria-busy", "true");
  await page.clock.runFor(LATENCY);
  await expect(people).toHaveAttribute("aria-busy", "false");
  // The skeleton keeps its placeholders until a timer that starts after the
  // request ends, so the clock moves until that timer has run. The first row
  // shows with no other timer.
  await expect(async () => {
    await page.clock.runFor(1);
    await expect(q.text("Person 1")).toBeVisible({ timeout: 100 });
  }).toPass();
}

withFramework(import.meta.dirname, async ({ framework, id, test }) => {
  test.beforeEach(async ({ page, q }) => {
    // The fake clock controls the request and the timers that show the rows of
    // the reveal. It keeps running until the test pauses it.
    await page.clock.install();
    await page.goto(`/${framework}/previews/${id}/`);
    await page.waitForFunction(isPreviewHydrated);
    await test.expect(q.text("Person 24")).toBeVisible({ timeout: 5000 });
    const now = await page.evaluate(() => Date.now());
    await page.clock.pauseAt(now + 1000);
  });

  test("reveals the content one row at a time from the top", async ({
    page,
    q,
  }) => {
    await reloadAndLoad(page, q);
    // The second person is in the next card, below the first person, so it
    // still shows its placeholder.
    await test.expect(q.text("Person 2")).toBeHidden();
    // The content fades in where its placeholder was.
    test
      .expect(await getAnimationName(q, "Person 1"))
      .toBe("ui-skeleton-reveal");
    // The last person is below the screen, so it shows with the first row and
    // without a fade.
    await test.expect(q.text("Person 24")).toBeAttached();
    test.expect(await getAnimationName(q, "Person 24")).toBe("none");
    await page.clock.resume();
    await test.expect(q.text("Person 2")).toBeVisible();
  });

  test("shows the placeholders again when loading restarts during the reveal", async ({
    page,
    q,
  }) => {
    await reloadAndLoad(page, q);
    await test.expect(q.text("Person 2")).toBeHidden();
    // The button is enabled as soon as the request ends.
    await q.button("Reload").click();
    await test.expect(q.region("People")).toHaveAttribute("aria-busy", "true");
    // The people have no data while they load, so their text is gone even if a
    // part kept its content. The placeholders are hidden from assistive
    // technologies, and only the pending marker tells that they render again.
    await test.expect(page.locator("[data-pending]")).not.toHaveCount(0);
    await page.clock.resume();
    // The next request takes 2 seconds, and the next reveal shows all people.
    await test.expect(q.text("Person 2")).toBeVisible({ timeout: 5000 });
  });

  test("replaces the placeholders at once with reduced motion", async ({
    page,
    q,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await reloadAndLoad(page, q);
    await test.expect(q.text("Person 2")).toBeVisible();
    test.expect(await getAnimationName(q, "Person 1")).toBe("none");
  });
});
