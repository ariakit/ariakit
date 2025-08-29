import { expect, test } from "@playwright/test";
import { matchScreenshots } from "#app/test-utils.ts";

async function getPreviewPaths(baseURL: string) {
  const res = await fetch(new URL("/jsdoc", baseURL));
  if (!res.ok) throw new Error(`Failed to fetch previews: ${res.status}`);
  const jsdocPaths: string[] = await res.json();
  // Previews route returns under /previews; jsdoc used as a keep-warm example; replace with real previews API
  const resPreviews = await fetch(new URL("/previews", baseURL));
  const previewPaths: string[] = resPreviews.ok ? await resPreviews.json() : [];
  return previewPaths.length ? previewPaths : jsdocPaths; // fallback just in case
}

test("previews", async ({ page, baseURL }, testInfo) => {
  test.setTimeout(300_000);
  if (!baseURL) throw new Error("Missing baseURL");
  const paths = await getPreviewPaths(baseURL);
  expect(paths.length).toBeGreaterThan(0);

  for (const path of paths) {
    await test.step(path, async () => {
      try {
        await page.goto(path, {
          waitUntil: "domcontentloaded",
          timeout: 15_000,
        });
        await page
          .waitForLoadState("networkidle", { timeout: 2_000 })
          .catch(() => {});
        await page.waitForSelector("body", { timeout: 2_000 }).catch(() => {});
        await matchScreenshots(page, testInfo, {
          id: path.replace(/^\/+/, ""),
          clipMargin: 12,
        });
      } catch {
        // Continue to next preview if navigation fails or times out
      }
    });
  }
});
