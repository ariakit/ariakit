import { query } from "@ariakit/test/playwright";
import type { Locator, Page, Route } from "@playwright/test";
import { gotoAndSettle } from "#app/test-utils/preview.ts";

// Helpers for the preview card tests in this folder.

// A preview frame loads lazily once it scrolls into view, and its example
// hydrates once its modules load. On a slow runner, the frame navigation can
// take longer than the assertion timeout, so the wait uses the test budget,
// like the preview hydration wait in withFramework.
export async function waitForFrameHydration(iframe: Locator) {
  await iframe.scrollIntoViewIfNeeded();
  const frame = iframe.contentFrame();
  await frame
    .locator("html[data-preview-hydrated]")
    .waitFor({ state: "attached" });
  return frame;
}

// The card shows its frame once the page in it has loaded and settled its
// popup. After a navigation, the wait spans the docs page, the card hydration,
// and the frame navigation, which can take longer than the assertion timeout on
// a slow runner, so the wait uses the test budget.
export async function waitForShownFrame(page: Page, title: string) {
  const iframe = page.locator(`iframe[title="${title}"]`);
  await page
    .locator(`[aria-busy="false"]:has(> iframe[title="${title}"])`)
    .waitFor({ state: "attached" });
  return iframe;
}

// The Combobox Group card is outside a preview grid and has no minimum height,
// so its frame has no floor and no grid row to fill. The frame loads another
// preview, as it does after a link in the page.
export async function gotoPreviewInCard(page: Page, src: string) {
  await gotoAndSettle(page, "/react/recipes/combobox-group/");
  const iframe = await waitForShownFrame(page, "Combobox Group");
  await loadInFrame(iframe, src);
  return iframe;
}

export async function loadInFrame(iframe: Locator, src: string) {
  const frame = await (await iframe.elementHandle())?.contentFrame();
  if (!frame) throw new Error("No frame");
  const previousUrl = frame.url();
  await iframe.evaluate((element, src) => {
    if (element instanceof HTMLIFrameElement) {
      element.src = src;
    }
  }, src);
  // A Next.js preview redirects to the Next.js server, so the frame URL is not
  // the one set here. The wait includes the load event.
  await frame.waitForURL((url) => url.href !== previousUrl);
  await iframe.scrollIntoViewIfNeeded();
}

// A narrow card or a wide example can leave the example wider than its
// scroller. The example also stays taller than its scroller, so it can scroll
// vertically too.
export async function widenExample(scroller: Locator) {
  await scroller.evaluate((element) => {
    // Islands and slots wrap the example without boxes, next to styles.
    const example = [...element.querySelectorAll("*")].find((child) => {
      const { display } = getComputedStyle(child);
      return display !== "contents" && display !== "none";
    });
    if (!(example instanceof HTMLElement)) throw new Error("No example");
    example.style.minWidth = "3000px";
    example.style.minHeight = "3000px";
  });
}

// The article example announces that it loaded 1.8 seconds after it hydrates,
// and its card hydrates when it scrolls into view. On a slow runner, the card
// can take longer than the assertion timeout to hydrate, so the wait uses the
// test budget, like the resize handle waits in the preview card tests.
// https://github.com/ariakit/ariakit/issues/8006
export async function waitForArticle(article: Locator) {
  await article.scrollIntoViewIfNeeded();
  const status = query(article).status();
  await status.filter({ hasText: "Article loaded" }).waitFor();
}

// The viewport edge is a ring. The border color follows the edge color even
// with no border to paint, so it would not show that the edge changed.
export async function getViewportEdge(viewport: Locator) {
  return viewport.evaluate((element) => getComputedStyle(element).boxShadow);
}

// Routes the modules that the islands in preview frames import to hydrate their
// examples. Returns the paths of the frames whose modules it routed, so a test
// can check that it changed the example it asserts on.
export async function routeExampleModules(
  page: Page,
  handler: (route: Route) => Promise<void>,
) {
  const routedFrames: string[] = [];
  await page.route("**/*", async (route, request) => {
    if (request.resourceType() !== "script") return route.fallback();
    const frame = request.frame();
    if (frame === page.mainFrame()) return route.fallback();
    const componentUrls: (string | null)[] = await frame
      .evaluate(() => {
        const islands = document.querySelectorAll("astro-island");
        return Array.from(islands, (island) => {
          const url = island.getAttribute("component-url");
          return url ? new URL(url, location.href).pathname : null;
        });
      })
      .catch(() => []);
    const { pathname } = new URL(request.url());
    if (!componentUrls.includes(pathname)) return route.fallback();
    routedFrames.push(new URL(frame.url()).pathname);
    await handler(route);
  });
  return routedFrames;
}

// The resize handle of a card names the viewport that it resizes, even while
// the handle is hidden.
export async function getPreviewViewport(article: Locator) {
  const handle = query(article).separator("Resize preview", {
    includeHidden: true,
  });
  const viewportId = await handle.getAttribute("aria-controls");
  return article.page().locator(`[id="${viewportId}"]`);
}

// The box of the example in an inline preview viewport, from the edges of the
// viewport.
export async function getExampleBox(viewport: Locator) {
  return viewport.evaluate((element) => {
    // Islands and slots wrap the example without boxes, next to styles.
    const example = [...element.querySelectorAll("*")].find((child) => {
      const { display } = getComputedStyle(child);
      return display !== "contents" && display !== "none";
    });
    if (!example) throw new Error("No example");
    const area = element.getBoundingClientRect();
    const box = example.getBoundingClientRect();
    return {
      top: box.top - area.top,
      bottom: area.bottom - box.bottom,
      height: box.height,
    };
  });
}
