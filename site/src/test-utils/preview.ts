import fs from "node:fs/promises";
import { test } from "@playwright/test";
import { frameworks, getIndexFile } from "#app/lib/frameworks.ts";
import { keys } from "#app/lib/object.ts";

function getPreviewId(dirname: string) {
  if (!dirname.includes("site/src")) return null;
  const id = dirname.replace(/^.*site\/src\/[^/]+\/(.+)$/, "$1");
  return id;
}

async function getPreviewFramworks(dirname: string) {
  const files = await fs.readdir(dirname);
  const frameworkNames: (keyof typeof frameworks)[] = [];
  for (const framework of keys(frameworks)) {
    const indexFile = getIndexFile(framework);
    if (indexFile && files.includes(indexFile)) {
      frameworkNames.push(framework);
    }
  }
  return frameworkNames;
}

interface WithFrameworkCallbackParams {
  id: string;
  framework: keyof typeof frameworks;
}

export async function withFramework(
  dirname: string,
  callback: (params: WithFrameworkCallbackParams) => Promise<void>,
) {
  const id = getPreviewId(dirname);
  if (!id) throw new Error(`Cannot parse preview id from ${dirname}`);
  const frameworkNames = await getPreviewFramworks(dirname);
  for (const framework of frameworkNames) {
    test.describe(framework, async () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(`/${framework}/previews/${id}`, {
          waitUntil: "networkidle",
        });
      });
      await callback({ id, framework });
    });
  }
}
