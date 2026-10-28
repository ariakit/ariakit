import type { Locator, Page, Route } from "@playwright/test";

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
