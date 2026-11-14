import type { Locator } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

function getCenter(locator: Locator) {
  return locator.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return rect.left + rect.width / 2;
  });
}

// The bar that travels is the `::after` pseudo-element of the navigation, which
// no locator finds, so its place comes from its computed style.
function getTravelingBarCenter(nav: Locator) {
  return nav.evaluate((element) => {
    const style = getComputedStyle(element, "::after");
    const rect = element.getBoundingClientRect();
    const start = rect.left + element.clientLeft - element.scrollLeft;
    const left = Number.parseFloat(style.left);
    return start + left + Number.parseFloat(style.width) / 2;
  });
}

withFramework(import.meta.dirname, async ({ test, query }) => {
  test("moves the bar from the old current link to the new one", async ({
    page,
    q,
  }) => {
    // The travel time is a custom property. A long one keeps the bar on its way
    // while the test reads it.
    await page.addStyleTag({ content: ":root { --glider-duration: 30s; }" });
    const nav = q.navigation("Main");
    const overview = query(nav).link("Overview");
    const analytics = query(nav).link("Analytics");
    await analytics.click();
    await test.expect(analytics).toHaveAttribute("aria-current", "page");
    await test.expect(nav).toHaveAttribute("data-bar-traveling");
    // The bar of the new current link waits for the bar that travels to it.
    await test.expect(analytics.locator(".control-bar")).toBeHidden();
    await test.expect
      .poll(async () => {
        const center = await getTravelingBarCenter(nav);
        if (center <= (await getCenter(overview))) return false;
        return center < (await getCenter(analytics));
      })
      .toBe(true);
  });

  test("shows the bar of the new current link when the travel ends", async ({
    q,
  }) => {
    const nav = q.navigation("Main");
    const analytics = query(nav).link("Analytics");
    await analytics.click();
    // The bar shows only after the bar that travels to it arrives.
    await test.expect(analytics.locator(".control-bar")).toBeVisible();
    await test.expect(nav).not.toHaveAttribute("data-bar-traveling");
  });

  test("shows the bar of the new current link at once with reduced motion", async ({
    page,
    q,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    // A travel would hide the bar for this long.
    await page.addStyleTag({ content: ":root { --glider-duration: 30s; }" });
    const nav = q.navigation("Main");
    const analytics = query(nav).link("Analytics");
    await analytics.click();
    await test.expect(analytics.locator(".control-bar")).toBeVisible();
    await test.expect(nav).not.toHaveAttribute("data-bar-traveling");
  });
});
