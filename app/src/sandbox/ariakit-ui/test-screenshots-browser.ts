import type { Page } from "@playwright/test";
import {
  waitForPreviewHydration,
  withFramework,
} from "#app/test-utils/preview.ts";
import { viewports } from "#app/test-utils/visual.ts";
import type { GallerySetting } from "./pages.ts";
import {
  GALLERY_SETTINGS,
  GALLERY_STORAGE_PREFIX,
  overviewPage,
  SCREENSHOT_FOCUS_ATTRIBUTE,
  showcasePages,
} from "./pages.ts";

type GallerySettingValues = Partial<Record<GallerySetting, string>>;

// The four combinations every showcase route is captured in. A setting with no
// value is the page default, which means no attribute on <html>.
const combinations = [
  ["light-canvas", { theme: "light" }],
  ["dark-canvas", { theme: "dark" }],
  ["light-raised", { theme: "light", surface: "raised" }],
  ["light-tinted", { theme: "light", surface: "tinted" }],
] as const satisfies readonly (readonly [string, GallerySettingValues])[];

const focusTargetSelector = `[${SCREENSHOT_FOCUS_ATTRIBUTE}]`;

// What a Tab press can reach. A page that renders any of these must mark one of
// them, because every baseline shows exactly one real focus ring.
const tabbableSelector =
  'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])';

const launcherId = "ariakit-ui-screenshot-focus-launcher";

// WebP stores each side in 14 bits and every engine fails to encode a taller
// capture. toHaveScreenshot captures at CSS scale, so the unit is CSS pixels.
const MAX_SCREENSHOT_HEIGHT = 16_383;

/**
 * Stores the settings the way the shell persists them and loads the route
 * again. The inline script in `index.astro` then applies them before the first
 * paint and before hydration, so components that read computed styles when they
 * mount, such as `PopoverArrow`, paint the colors a person with those settings
 * actually sees. Switching the attributes on a live page would leave those
 * components on the colors of the setting the page loaded with.
 */
async function loadWithSettings(page: Page, values: GallerySettingValues) {
  await page.evaluate(
    ({ prefix, names, settings }) => {
      for (const name of names) {
        const value = settings[name];
        if (value) {
          localStorage.setItem(prefix + name, value);
        } else {
          localStorage.removeItem(prefix + name);
        }
      }
    },
    {
      prefix: GALLERY_STORAGE_PREFIX,
      names: GALLERY_SETTINGS,
      settings: values,
    },
  );
  await page.reload({ waitUntil: "load" });
  await waitForPreviewHydration(page);
}

/**
 * Moves real keyboard focus to the page's focus target. A `Tab` press, not
 * `element.focus()`, is what puts the engine in keyboard modality, which is
 * what makes `:focus-visible` match in Chrome, Firefox and Safari.
 */
async function focusScreenshotTarget(page: Page) {
  await page.evaluate(
    ({ selector, id }) => {
      const target = document.querySelector(selector);
      if (!target?.parentNode) {
        throw new Error(`No element matches ${selector}`);
      }
      const launcher = document.createElement("span");
      launcher.id = id;
      launcher.tabIndex = 0;
      // Out of flow and invisible, so inserting it cannot change the captured
      // layout. Sequential focus order follows DOM order, so the marked element
      // is still the next stop after it.
      launcher.style.cssText =
        "position:fixed;top:0;inset-inline-start:0;width:1px;height:1px;opacity:0";
      target.parentNode.insertBefore(launcher, target);
      launcher.focus();
    },
    { selector: focusTargetSelector, id: launcherId },
  );
  await page.keyboard.press("Tab");
  await page.evaluate((id) => {
    document.getElementById(id)?.remove();
  }, launcherId);
}

function countFocusTargets(page: Page) {
  return page.evaluate(
    ({ focusSelector, tabbable }) => {
      const main = document.querySelector("main");
      if (!main) return { markers: -1, tabbables: -1 };
      return {
        markers: main.querySelectorAll(focusSelector).length,
        tabbables: main.querySelectorAll(tabbable).length,
      };
    },
    { focusSelector: focusTargetSelector, tabbable: tabbableSelector },
  );
}

const screenshotRoutes = [
  { route: undefined, title: overviewPage.title },
  ...showcasePages.map((page) => ({ route: page.id, title: page.title })),
];

for (const { route, title } of screenshotRoutes) {
  withFramework(import.meta.dirname, { route }, async ({ test }) => {
    test.use({ viewport: viewports.desktop });
    // Each test loads the route four times and takes four full-page captures.
    // Safari needs about a second per 6000px capture locally, macOS runners are
    // slower, and generating a baseline needs two identical captures.
    test.describe.configure({ timeout: 180_000 });

    test("content @visual", async ({ page, q, visual }) => {
      const content = q.main();
      await test.expect(q.heading(title, { level: 1 })).toBeVisible();

      const { markers, tabbables } = await countFocusTargets(page);
      test.expect(markers).toBe(tabbables > 0 ? 1 : 0);

      const { height } = await content.evaluate((node) =>
        node.getBoundingClientRect(),
      );
      test.expect(height).toBeLessThanOrEqual(MAX_SCREENSHOT_HEIGHT);

      for (const [name, values] of combinations) {
        await loadWithSettings(page, values);
        if (markers > 0) {
          await focusScreenshotTarget(page);
          const target = page.locator(focusTargetSelector);
          await test.expect(target).toBeFocused();
          await test.expect
            .poll(() =>
              target.evaluate((node) => node.matches(":focus-visible")),
            )
            .toBe(true);
        }
        await visual({
          element: content,
          fullPage: true,
          // A margin would pull in the sidebar border and the sticky header.
          clipMargin: 0,
          viewports: { desktop: viewports.desktop },
          styles: { [name]: {} },
        });
      }
    });
  });
}
