import { isFramework } from "#app/lib/framework.ts";
import { test } from "#app/test-utils/fixtures.ts";
import { viewports } from "#app/test-utils/visual.ts";

const TIMEOUT_PER_STEP = 20_000;

async function getPreviewPaths(baseURL: string) {
  const resPreviews = await fetch(new URL("/previews", baseURL));
  if (!resPreviews.ok) {
    throw new Error(`Failed to fetch previews: ${resPreviews.status}`);
  }
  return (await resPreviews.json()) as string[];
}

test.describe.configure({ retries: 0 });

test("previews @visual", async ({ page, baseURL, visual }) => {
  test.skip(!process.env.VISUAL_TEST);
  if (!baseURL) {
    throw new Error("Missing baseURL");
  }
  const paths = await getPreviewPaths(baseURL);
  test.setTimeout(paths.length * TIMEOUT_PER_STEP);

  for (const path of paths) {
    await test.step(
      path,
      async () => {
        await page.goto(path);
        const id = path.replace(/^\/+/, "");
        const preview = /^([^/]+)\/previews\/(.+?)\/?$/.exec(id);
        const framework = preview?.[1];
        if (!isFramework(framework) || !preview?.[2]) {
          throw new Error(`Unexpected preview path: ${path}`);
        }
        await visual({
          item: `previews/${preview[2]}`,
          framework,
          viewports,
        });
      },
      { timeout: TIMEOUT_PER_STEP },
    );
  }
});
