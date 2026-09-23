import { test } from "#app/test-utils/fixtures.ts";
import { defaultStyles, viewports } from "#app/test-utils/visual.ts";

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
        if (!process.env.VISONAUT_EXECUTOR_DIRECTORY) {
          await page.goto(path);
          await visual({ id: path.replace(/^\/+/, ""), viewports });
          return;
        }
        const match = /^\/(react|solid)\/previews\/(.+?)\/?$/.exec(path);
        const framework = match?.[1];
        const preview = match?.[2];
        if (!framework || !preview) {
          throw new Error(`Invalid visual preview path: ${path}`);
        }
        for (const colorScheme of ["light", "dark"] as const) {
          await page.emulateMedia({ colorScheme });
          await page.goto(path);
          await visual({
            item: `previews/${preview}`,
            framework,
            viewports,
            styles: { [colorScheme]: defaultStyles[colorScheme] },
          });
        }
      },
      { timeout: TIMEOUT_PER_STEP },
    );
  }
});
