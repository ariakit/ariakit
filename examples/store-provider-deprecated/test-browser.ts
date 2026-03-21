import { expect } from "@playwright/test";
import { test } from "../test-utils.ts";

test("warns on implicit compatible provider context", async ({ page }) => {
  const warnings: string[] = [];
  page.on("console", (message) => {
    if (message.type() !== "warning") return;
    warnings.push(message.text());
  });

  await page.getByRole("button", { name: "Show combobox" }).click();

  await expect(page.getByRole("button", { name: "Apple" })).toBeVisible();
  await expect
    .poll(() => warnings)
    .toContain(
      "CompositeItem is reading its store from ComboboxProvider implicitly. This is deprecated and will stop working in a future version. Pass `store={ComboboxProvider}` to keep the current behavior.",
    );
});
