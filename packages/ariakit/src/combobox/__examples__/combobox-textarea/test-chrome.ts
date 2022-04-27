import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";
import { test as baseTest, expect } from "@playwright/test";

const istanbulCLIOutput = path.join(process.cwd(), "coverage");

export function generateUUID(): string {
  return crypto.randomBytes(16).toString("hex");
}

export const test = baseTest.extend({
  context: async ({ context }, use) => {
    await context.addInitScript(() =>
      window.addEventListener("beforeunload", () =>
        (window as any).collectIstanbulCoverage(
          JSON.stringify((window as any).__coverage__)
        )
      )
    );
    await fs.promises.mkdir(istanbulCLIOutput, { recursive: true });
    await context.exposeFunction(
      "collectIstanbulCoverage",
      (coverageJSON: string) => {
        if (coverageJSON)
          fs.writeFileSync(
            path.join(
              istanbulCLIOutput,
              `playwright_coverage_${generateUUID()}.json`
            ),
            coverageJSON
          );
      }
    );
    await use(context);
    for (const page of context.pages()) {
      await page.evaluate(() =>
        (window as any).collectIstanbulCoverage(
          JSON.stringify((window as any).__coverage__)
        )
      );
      await page.close();
    }
  },
});

test("basic test", async ({ page }, testInfo) => {
  console.log(testInfo.file);
  await page.goto("http://localhost:3000/examples/combobox-textarea");
  const element = await page.locator("role=combobox[name='Comment']");
  await element.click();
  await element.type("Hello @");
  await expect(page.locator("role=listbox")).toBeVisible();
  await page.locator("role=option[name='lluia']").hover();
  await page.locator("role=option[name='lluia']").click();
  await expect(page.locator("role=combobox[name='Comment']")).toHaveValue(
    "Hello @lluia "
  );
});
