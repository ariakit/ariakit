import { test } from "@playwright/test";
import { viewports, visual } from "#app/test-utils/visual.ts";

const TIMEOUT_PER_STEP = 10_000;

async function getPreviewPaths(baseURL: string) {
  const resPreviews = await fetch(new URL("/previews", baseURL));
  if (!resPreviews.ok) {
    throw new Error(`Failed to fetch previews: ${resPreviews.status}`);
  }
  return (await resPreviews.json()) as string[];
}

test.describe.configure({ retries: 0 });

test("previews @visual", async ({ page, baseURL }) => {
  test.skip(!process.env.VISUAL_TEST);
  if (!baseURL) {
    throw new Error("Missing baseURL");
  }
  const paths = await getPreviewPaths(baseURL);
  test.setTimeout(paths.length * TIMEOUT_PER_STEP);

  // Set prefers-reduced-motion to reduce flakiness from animations
  await page.emulateMedia({ reducedMotion: "reduce" });

  for (const path of paths) {
    await test.step(
      path,
      async () => {
        await page.goto(path);
        const id = path.replace(/^\/+/, "");
        await visual(page, { id, viewports });
      },
      { timeout: TIMEOUT_PER_STEP },
    );
  }
});
