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

  // https://github.com/ariakit/ariakit/pull/6976
  test("opens the searchable select with an autofocused item without scrolling the page", async ({
    page,
    q,
  }) => {
    await page.evaluate(() => {
      document.body.style.paddingTop = "400px";
      window.scrollTo({ top: 300 });
    });
    await q.combobox("Select with Combobox and manual Tab").click();
    await test.expect(q.combobox("Find a branch or tag")).toBeFocused();
    await test.expect(q.option("main")).toBeInViewport();
    // Read the scroll position once instead of retrying. A retrying assertion
    // would also pass on an implementation that scrolls the page and then
    // scrolls it back.
    test.expect(await page.evaluate(() => window.scrollY)).toBe(300);
  });
});
