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

  test("https://github.com/ariakit/ariakit/issues/4324", async ({
    page,
    q,
  }) => {
    const button = q.button("Provider Add block");
    const dialog = q.dialog("Provider Add block");
    await button.click();
    await expect(dialog).toBeVisible();
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.mouse.click(10, 10);
    await expect(dialog).not.toBeVisible();
    await expect(button).not.toBeInViewport();
  });
});
