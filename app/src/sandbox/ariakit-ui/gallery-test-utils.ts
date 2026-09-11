import type { Locator, Page } from "@playwright/test";
import { isPreviewHydrated } from "#app/lib/preview-hydration.ts";
import { withFramework } from "#app/test-utils/preview.ts";
import type { GalleryPageId, GallerySetting } from "./pages.ts";
import {
  GALLERY_SETTINGS,
  GALLERY_STORAGE_PREFIX,
  getGalleryHref,
  getGalleryPage,
  overviewPage,
} from "./pages.ts";

export type WithFrameworkCallback = Parameters<typeof withFramework>[1];

/**
 * The header settings in their `data-` attribute form. A setting with no value
 * is the page default, which means no attribute on `<html>`.
 */
export type GallerySettingValues = Partial<Record<GallerySetting, string>>;

function getPageTitle(pageId?: GalleryPageId) {
  return pageId ? getGalleryPage(pageId).title : overviewPage.title;
}

/**
 * Waits until the gallery shows a page after a load or a reload. The preview is
 * marked as hydrated when the overview commits, and the page of the hash
 * replaces it in the next commit, so the page heading carries the wait.
 */
export async function waitForGalleryPage(page: Page, pageId?: GalleryPageId) {
  await page.waitForFunction(isPreviewHydrated);
  await page
    .getByRole("heading", { level: 1, name: getPageTitle(pageId), exact: true })
    .waitFor();
}

/**
 * Stores the settings the way the shell persists them and loads the page again.
 * The shell's inline script then applies them before the first paint and before
 * hydration, so components that read computed styles when they mount, such as
 * `PopoverArrow`, paint the colors a person with those settings actually sees.
 * Switching the attributes on a live page would leave those components on the
 * colors of the setting the page loaded with.
 */
export async function loadWithSettings(
  page: Page,
  pageId: GalleryPageId | undefined,
  values: GallerySettingValues,
) {
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
  await waitForGalleryPage(page, pageId);
}

/**
 * Moves real keyboard focus to an element. A Tab press, not a programmatic
 * focus, is what makes `:focus-visible` match in every engine, and stepping
 * back and forward returns to the element in each engine's own Tab order.
 */
export async function tabTo(page: Page, element: Locator) {
  await element.focus();
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Tab");
}

/** Shows a gallery page in the loaded preview through its route hash. */
export async function openGalleryPage(page: Page, pageId?: GalleryPageId) {
  await page.evaluate((hash) => {
    location.hash = hash;
  }, getGalleryHref(pageId));
  await waitForGalleryPage(page, pageId);
}

/**
 * Runs tests against one gallery page. Each test starts on the preview that
 * `withFramework` loaded, with the route hash of the page applied.
 */
export function withGalleryPage(
  pageId: GalleryPageId | undefined,
  callback: WithFrameworkCallback,
) {
  withFramework(import.meta.dirname, async (params) => {
    // The page id in the title keeps the screenshot names of the pages that
    // share one test file distinct.
    params.test.describe(pageId ?? "overview", () => {
      params.test.beforeEach(async ({ page }) => {
        await openGalleryPage(page, pageId);
      });
      return callback(params);
    });
  });
}
