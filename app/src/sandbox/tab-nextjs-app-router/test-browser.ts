import { withFramework } from "#app/test-utils/preview.ts";

function getNextjsUrl(pageUrl: string, path: string) {
  return new URL(path, pageUrl).href;
}

withFramework(import.meta.dirname, async ({ id, test }) => {
  test("navigates through links and tabs", async ({ page, q }) => {
    await test.expect(q.tabpanel("Hot")).toBeVisible();
    await q.link("latest posts").click();
    await test.expect(page).toHaveURL(new RegExp(`/${id}/new$`));
    await test.expect(q.tabpanel("New")).toBeVisible();
    await q.link("trending posts").click();
    await test.expect(page).toHaveURL(new RegExp(`/${id}$`));
    await test.expect(q.tabpanel("Hot")).toBeVisible();

    await q.tab("New").click();
    await test.expect(page).toHaveURL(new RegExp(`/${id}/new$`));
    await test.expect(q.tabpanel("New")).toBeVisible();
    await test.expect(q.tab("New")).toBeFocused();
    await q.tab("Hot").click();
    await test.expect(q.tabpanel("Hot")).toBeVisible();
    await test.expect(q.tab("Hot")).toBeFocused();
  });

  test("selects route-backed tabs manually with the keyboard", async ({
    page,
    q,
  }) => {
    await q.tab("Hot").press("ArrowRight");
    await test.expect(q.tab("New")).toBeFocused();
    await test.expect(page).toHaveURL(new RegExp(`/${id}$`));
    await test.expect(q.tabpanel("Hot")).toBeVisible();
    await page.keyboard.press("Enter");
    await test.expect(page).toHaveURL(new RegExp(`/${id}/new$`));
    await test.expect(q.tabpanel("New")).toBeVisible();
    await page.keyboard.press("ArrowLeft");
    await test.expect(q.tab("Hot")).toBeFocused();
    await test.expect(page).toHaveURL(new RegExp(`/${id}/new$`));
    await test.expect(q.tabpanel("New")).toBeVisible();
    await page.keyboard.press("Space");
    await test.expect(page).toHaveURL(new RegExp(`/${id}$`));
    await test.expect(q.tabpanel("Hot")).toBeVisible();
  });

  test("restores route-backed tabs with browser history", async ({
    page,
    q,
  }) => {
    await page.goto(getNextjsUrl(page.url(), `/${id}/new`));
    await test.expect(q.tabpanel("New")).toBeVisible();
    await page.goto(getNextjsUrl(page.url(), `/${id}`));
    await test.expect(q.tabpanel("Hot")).toBeVisible();
    await page.goBack();
    await test.expect(q.tabpanel("New")).toBeVisible();
    await page.goForward();
    await test.expect(q.tabpanel("Hot")).toBeVisible();
  });
});
