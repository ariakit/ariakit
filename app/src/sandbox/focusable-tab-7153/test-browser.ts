import type { Locator } from "@ariakit/test/playwright";
import { errors, expect } from "@ariakit/test/playwright";
import { withFramework } from "#app/test-utils/preview.ts";

// Playwright's actionability check treats `aria-disabled` as not enabled and
// refuses to click, so the gesture has to be forced. Forcing skips Playwright's
// own checks, not the browser's hit testing, which is what blocks the truly
// disabled link through `pointer-events: none`.
function middleClick(locator: Locator) {
  return locator.click({ button: "middle", force: true });
}

async function expectNavigation(locator: Locator, destination: RegExp) {
  const page = locator.page();
  const url = page.url();
  // Chromium and Firefox open the destination in a new tab, while WebKit
  // follows the middle click in the current one. Race both so neither engine
  // needs its own branch.
  const newTab = page
    .context()
    .waitForEvent("page")
    .catch(() => null);
  const sameTab = page
    .waitForURL(destination)
    .then(() => null)
    .catch(() => null);
  await middleClick(locator);
  const opened = await Promise.race([newTab, sameTab]);
  await expect(opened ?? page).toHaveURL(destination);
  if (!opened) return;
  await expect(page).toHaveURL(url);
}

async function expectNoNavigation(locator: Locator) {
  const page = locator.page();
  const url = page.url();
  // A blocked gesture leaves nothing behind to assert on, so wait out the
  // window in which the browser would have delivered the destination. The
  // slowest delivery measured across the three engines was 1.4s, so this
  // budget leaves room for a loaded runner without waiting on the clock for
  // longer than the gesture can plausibly take.
  const newTab = page
    .context()
    .waitForEvent("page", { timeout: 5_000 })
    .catch((error) => {
      if (!(error instanceof errors.TimeoutError)) throw error;
      return null;
    });
  const [opened] = await Promise.all([newTab, middleClick(locator)]);
  expect(opened, "the link opened in a new tab").toBeNull();
  await expect(page).toHaveURL(url);
}

withFramework(import.meta.dirname, async ({ test }) => {
  test("middle click opens an enabled link", async ({ q }) => {
    await expectNavigation(q.link("Enabled link"), /\?link=enabled$/);
  });

  test("middle click opens an enabled tab rendered as a link", async ({
    q,
  }) => {
    await expectNavigation(q.tab("Overview"), /\?tab=overview$/);
  });

  // Truly disabled elements get `pointer-events: none`, so the pointer lands on
  // the wrapper and never reaches this link. That also makes the link
  // impossible to hover, which is why this case alone has no hit-target pin.
  // https://github.com/ariakit/ariakit/issues/7153
  test("middle click does not open a disabled link", async ({ q }) => {
    await expectNoNavigation(q.link("Disabled link"));
  });

  // https://github.com/ariakit/ariakit/issues/7153
  test("middle click does not open an accessible disabled link", async ({
    q,
  }) => {
    const link = q.link("Accessible disabled link");
    // Forcing the click skips Playwright's hit-target check, so hover first to
    // keep it. Without that pin, a later fixture change could move the gesture
    // off this link and leave the test passing for the wrong reason.
    await link.hover();
    await expectNoNavigation(link);
  });

  // https://github.com/ariakit/ariakit/issues/7153
  test("middle click does not open a disabled tab rendered as a link", async ({
    q,
  }) => {
    const tab = q.tab("Billing");
    // Same hit-target pin as above.
    await tab.hover();
    await expectNoNavigation(tab);
  });
});
