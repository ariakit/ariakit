import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("hides the separator before a segment while it is checked", async ({
    q,
  }) => {
    // Day is checked at first, so the separator after it already hides.
    const month = q.radio("Month");
    // The input fills its card, which follows the separator.
    const mark = month.locator("xpath=../preceding-sibling::*[1]");
    await test.expect(mark).toHaveAttribute("aria-hidden", "true");
    await test.expect(mark).toHaveCSS("opacity", "1");
    await month.click();
    await test.expect(month).toBeChecked();
    // The click leaves the pointer on Month, which would also hide the mark, so
    // hover another segment. Day is no longer checked, so the mark after it
    // shows, and hiding it again on hover crosses its whole transition.
    const day = q.radio("Day");
    const dayMark = day.locator("xpath=../following-sibling::*[1]");
    await test.expect(dayMark).toHaveCSS("opacity", "1");
    await day.hover();
    await test.expect(dayMark).toHaveCSS("opacity", "0");
    await test.expect(mark).toHaveCSS("opacity", "0");
  });

  test("skips the disabled segment with the arrow keys", async ({
    page,
    q,
  }) => {
    await page.keyboard.press("Tab");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await test.expect(q.radio("Month")).toBeChecked();
    await page.keyboard.press("ArrowRight");
    await test.expect(q.radio("Year")).not.toBeChecked();
    await test.expect(q.radio("Day")).toBeChecked();
  });
});
