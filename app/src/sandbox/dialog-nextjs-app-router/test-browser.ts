import { withFramework } from "#app/test-utils/preview.ts";

function getNextjsUrl(pageUrl: string, path: string) {
  return new URL(path, pageUrl).href;
}

withFramework(import.meta.dirname, async ({ id, test }) => {
  test("opens and closes the route-driven dialog", async ({ page, q }) => {
    await q.link("Login").click();
    await test.expect(page).toHaveURL(new RegExp(`/${id}/login$`));
    await test.expect(q.dialog("Login")).toBeVisible();
    await test.expect(q.textbox("Email")).toBeFocused();

    await page.keyboard.press("Escape");
    await test.expect(page).toHaveURL(new RegExp(`/${id}$`));
    await test.expect(q.dialog("Login")).not.toBeVisible();
    await test.expect(q.link("Login")).toBeFocused();

    await page.goBack();
    await test.expect(q.dialog("Login")).toBeVisible();
    await page.mouse.click(1, 1);
    await test.expect(page).toHaveURL(new RegExp(`/${id}$`));
    await test.expect(q.link("Login")).toBeFocused();
  });

  test("supports direct navigation and browser history", async ({
    page,
    q,
  }) => {
    await page.goto(getNextjsUrl(page.url(), `/${id}/login`));
    await test.expect(q.dialog("Login")).toBeVisible();
    await test.expect(q.textbox("Email")).toBeFocused();

    await page.goBack();
    await test.expect(q.dialog("Login")).not.toBeVisible();
    await page.goForward();
    await test.expect(q.dialog("Login")).toBeVisible();
    await page.reload();
    await test.expect(q.dialog("Login")).toBeVisible();

    await page.keyboard.press("Enter");
    await test.expect(page).toHaveURL(new RegExp(`/${id}$`));
    await test.expect(q.dialog("Login")).not.toBeVisible();
    await test.expect(q.link("Login")).toBeFocused();
  });
});
