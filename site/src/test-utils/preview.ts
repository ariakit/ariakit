import { readdirSync } from "node:fs";
import { query } from "@ariakit/test/playwright";
import { test } from "@playwright/test";
import { frameworks, getIndexFile } from "#app/lib/frameworks.ts";
import { keys } from "#app/lib/object.ts";
import { visualTest } from "./visual.ts";

function getPreviewId(dirname: string) {
  if (!dirname.includes("site/src")) return null;
  const id = dirname.replace(/^.*site\/src\/[^/]+\/(.+)$/, "$1");
  return id;
}

function getPreviewFramworks(dirname: string) {
  const files = readdirSync(dirname);
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
  test: typeof visualTest;
  framework: keyof typeof frameworks;
  query: typeof query;
}

export function withFramework(
  dirname: string,
  callback: (params: WithFrameworkCallbackParams) => Promise<void>,
) {
  const id = getPreviewId(dirname);
  if (!id) {
    throw new Error(`Cannot parse preview id from ${dirname}`);
  }
  const frameworkNames = getPreviewFramworks(dirname);
  for (const framework of frameworkNames) {
    test.describe(framework, { tag: `@${framework}` }, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(`/${framework}/previews/${id}/`, {
          waitUntil: "networkidle",
        });
      });
      callback({ id, framework, query, test: visualTest });
    });
  }
}
