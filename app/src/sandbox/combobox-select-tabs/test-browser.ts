import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

const cases = ["Select with Tab", "Select with Combobox and Tab"];

withFramework(import.meta.dirname, async ({ test }) => {
  test("opens and reopens the searchable select without scrolling the page", async ({
    page,
    q,
  }) => {
    await page.setViewportSize({ width: 800, height: 400 });

    const select = q.combobox("Select with Combobox and manual Tab");
    const dialog = q.dialog();

    await select.scrollIntoViewIfNeeded();
    const scrollY = await page.evaluate(() => window.scrollY);
    test.expect(scrollY).toBeGreaterThan(0);
    await page.evaluate((scrollY) => {
      const style = document.createElement("style");
      style.textContent = "html { scroll-behavior: smooth !important }";
      document.head.append(style);
      window.addEventListener("scroll", () => {
        if (window.scrollY === scrollY) return;
        document.documentElement.dataset.scrollMoved = "true";
      });
    }, scrollY);

    await select.click();
    await test.expect(dialog).toBeVisible();
    await test.expect(q.option("main")).toBeInViewport();
    await flushFrames(page);
    test.expect(await page.evaluate(() => window.scrollY)).toBe(scrollY);
    test
      .expect(
        await page.evaluate(() => document.documentElement.dataset.scrollMoved),
      )
      .toBeUndefined();

    await page.mouse.click(1, 1);
    await test.expect(dialog).toHaveCount(0);

    await select.click();
    await test.expect(dialog).toBeVisible();
    await test.expect(q.option("main")).toBeInViewport();
    await flushFrames(page);
    test.expect(await page.evaluate(() => window.scrollY)).toBe(scrollY);
    test
      .expect(
        await page.evaluate(() => document.documentElement.dataset.scrollMoved),
      )
      .toBeUndefined();
  });

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
