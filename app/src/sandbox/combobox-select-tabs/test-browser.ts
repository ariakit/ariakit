import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

const cases = ["Select with Tab", "Select with Combobox and Tab"];

withFramework(import.meta.dirname, async ({ test }) => {
  test("reopens the searchable select without writing the document scroll position", async ({
    page,
    q,
  }) => {
    const select = q.combobox("Select with Combobox and Tab");
    const dialog = q.dialog();

    await select.click();
    await test.expect(dialog).toBeVisible();
    await page.mouse.click(1, 1);
    await test.expect(dialog).toHaveCount(0);

    await page.evaluate(() => {
      const scroller = document.scrollingElement;
      if (!scroller) throw new Error("Document scrolling element is missing");
      const scrollTo = scroller.scrollTo.bind(scroller);
      document.documentElement.dataset.documentScrollCalls = "0";
      Object.defineProperty(scroller, "scrollTo", {
        configurable: true,
        value: (...args: unknown[]) => {
          const { dataset } = document.documentElement;
          const calls = Number(dataset.documentScrollCalls);
          dataset.documentScrollCalls = String(calls + 1);
          Reflect.apply(scrollTo, undefined, args);
        },
      });
    });

    await select.click();
    await test.expect(dialog).toBeVisible();
    await test.expect(q.option("main")).toBeInViewport();
    await flushFrames(page, 3);

    test
      .expect(
        await page.evaluate(
          () => document.documentElement.dataset.documentScrollCalls,
        ),
      )
      .toBe("0");
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
