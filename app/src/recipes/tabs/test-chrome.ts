import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("shows the panel of each tab", async ({ q }) => {
    await test.expect(q.tabpanel("Overview")).toContainText("June release");
    await q.tab("Activity").click();
    await test.expect(q.tabpanel("Activity")).toContainText("Maya Chen");
    await test.expect(q.tabpanel("Overview")).toHaveCount(0);
  });

  test("moves between tabs and selects them with the arrow keys", async ({
    q,
    page,
  }) => {
    await q.tab("Overview").click();
    await page.keyboard.press("ArrowRight");
    await test.expect(q.tab("Activity")).toBeFocused();
    await test.expect(q.tabpanel("Activity")).toBeVisible();
    await page.keyboard.press("End");
    await test.expect(q.tab("Members")).toBeFocused();
    await test.expect(q.tabpanel("Members")).toBeVisible();
    await page.keyboard.press("ArrowRight");
    await test.expect(q.tab("Overview")).toBeFocused();
  });

  test("hides the separator before a tab while the tab is selected", async ({
    q,
  }) => {
    const members = q.tab("Members");
    const mark = members.locator("xpath=preceding-sibling::*[1]");
    await test.expect(mark).toHaveAttribute("aria-hidden", "true");
    await test.expect(mark).toHaveCSS("opacity", "1");
    await members.click();
    await test.expect(members).toHaveAttribute("aria-selected", "true");
    // The click leaves the pointer on Members, which would also hide the mark,
    // so hover another tab. Overview is no longer selected, so the mark after
    // it shows, and hiding it again on hover crosses its whole transition.
    const overview = q.tab("Overview");
    const overviewMark = overview.locator("xpath=following-sibling::*[1]");
    await test.expect(overviewMark).toHaveCSS("opacity", "1");
    await overview.hover();
    await test.expect(overviewMark).toHaveCSS("opacity", "0");
    await test.expect(mark).toHaveCSS("opacity", "0");
  });
});
