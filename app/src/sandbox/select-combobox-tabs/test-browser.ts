import { withFramework } from "#app/test-utils/preview.ts";

const cases = ["Select with Tab", "Select with Combobox and Tab"];

withFramework(import.meta.dirname, async ({ test }) => {
  for (const label of cases) {
    test(`${label} restores the selected option after switching tabs`, async ({
      page,
      q,
    }) => {
      const select = q.combobox(label);
      const firstOption = page.getByRole("option").first();
      const lastOption = page.getByRole("option").last();

      await select.click();
      await test.expect(firstOption).toHaveAttribute("aria-selected", "true");
      await test.expect(firstOption).toHaveAttribute("data-active-item");

      await lastOption.click();
      await test.expect(page.getByRole("dialog")).not.toBeVisible();

      await page.keyboard.press("ArrowDown");
      await test.expect(firstOption).not.toBeInViewport();
      await test.expect(lastOption).toBeInViewport();
      await test.expect(lastOption).toHaveAttribute("aria-selected", "true");
      await test.expect(lastOption).toHaveAttribute("data-active-item");
      await test.expect(lastOption).toHaveAttribute("data-focus-visible");

      await page.keyboard.press("PageUp");
      await test.expect(lastOption).not.toBeInViewport();

      await page.keyboard.press("ArrowRight");
      await test.expect(q.tab("Tags")).toHaveAttribute("aria-selected", "true");
      await test.expect(firstOption).toBeInViewport();
      await test.expect(lastOption).not.toBeInViewport();

      await page.keyboard.press("ArrowLeft");
      await test.expect(firstOption).not.toBeInViewport();
      await test.expect(lastOption).toBeInViewport();
    });
  }
});
