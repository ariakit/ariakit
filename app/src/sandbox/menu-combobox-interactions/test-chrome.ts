import { expect } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

const cases = [
  ["Provider", "Provider Add block", "Search provider blocks"],
  ["Store", "Store Add block", "Search store blocks"],
] as const;

withFramework(import.meta.dirname, async ({ test }) => {
  for (const [name, buttonLabel, searchLabel] of cases) {
    test(`auto select first option with ${name}`, async ({ q }) => {
      await q.button(buttonLabel).click();
      await expect(q.dialog(buttonLabel)).toBeVisible();
      await q.combobox(searchLabel).fill("a");
      await expect(q.option("Audio")).toHaveAttribute("data-active-item");
    });
  }
});
