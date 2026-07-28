import type { Page } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

async function getNewTabModifier(page: Page) {
  const isMac = await page.evaluate(() => navigator.platform.startsWith("Mac"));
  return isMac ? "Meta" : "Control";
}

function hasSearchParam(name: string, value: string | string[]) {
  return (url: URL) => {
    const values = Array.isArray(value) ? value : [value];
    const actualValues = url.searchParams.getAll(name);
    if (actualValues.length !== values.length) return false;
    return values.every((item) => actualValues.includes(item));
  };
}

function getNextjsUrl(pageUrl: string, path: string) {
  return new URL(path, pageUrl).href;
}

withFramework(import.meta.dirname, async ({ id, query, test }) => {
  test("uses the default filters", async ({ q }) => {
    await test.expect(q.combobox("Language")).toHaveText("English");
    await test.expect(q.combobox("Status")).toHaveText("Any");
  });

  test("selects a language with the mouse and keyboard", async ({
    page,
    q,
  }) => {
    await q.combobox("Language").click();
    await q.option("French").click();
    await page.waitForURL(hasSearchParam("lang", "fr"));
    await test.expect(q.combobox("Language")).toHaveText("French");

    await q.combobox("Language").click();
    await page.keyboard.press("PageDown");
    await test.expect(q.option("German")).toHaveAttribute("data-active-item");
    await page.keyboard.press("Space");
    await page.waitForURL(hasSearchParam("lang", "de"));
    await test.expect(q.combobox("Language")).toHaveText("German");
  });

  test("reads filters from the URL and browser history", async ({
    page,
    q,
  }) => {
    await page.goto(getNextjsUrl(page.url(), `/${id}?lang=fr`));
    await test.expect(q.combobox("Language")).toHaveText("French");
    await q.combobox("Language").click();
    await q.option("German").click();
    await page.waitForURL(hasSearchParam("lang", "de"));
    await page.goBack();
    await page.waitForURL(hasSearchParam("lang", "fr"));
    await test.expect(q.combobox("Language")).toHaveText("French");
    await page.goForward();
    await test.expect(q.combobox("Language")).toHaveText("German");
  });

  test("opens a single-value option in a new tab", async ({ page, q }) => {
    // Opening a new tab may cold-start the preview worker under CI load.
    test.slow();
    const language = q.combobox("Language");
    await language.click();
    await test.expect(language).toHaveAttribute("aria-expanded", "true");
    const modifier = await getNewTabModifier(page);
    const [newPage] = await Promise.all([
      page.context().waitForEvent("page"),
      q.option("French").click({ modifiers: [modifier] }),
    ]);

    await newPage.waitForURL(hasSearchParam("lang", "fr"));
    await test.expect(query(newPage).combobox("Language")).toHaveText("French");
    await test.expect(q.combobox("Language")).toHaveText("English");
  });

  test("selects multiple statuses", async ({ page, q }) => {
    await q.combobox("Status").click();
    await q.option("Published").click();
    await page.waitForURL(hasSearchParam("status", "published"));
    await test.expect(q.combobox("Status")).toHaveText("Published");

    await q.option("Draft").click();
    await page.waitForURL(hasSearchParam("status", ["draft", "published"]));
    await test.expect(q.combobox("Status")).toHaveText("2 selected");

    await q.option("Archived").click();
    await page.waitForURL(
      hasSearchParam("status", ["draft", "published", "archived"]),
    );
    await test.expect(q.combobox("Status")).toHaveText("3 selected");

    await q.option("Published").click();
    await page.waitForURL(hasSearchParam("status", ["draft", "archived"]));
    await page.reload();
    await test.expect(q.combobox("Status")).toHaveText("2 selected");
  });

  test("opens a multi-value option in a new tab", async ({
    browserName,
    page,
    q,
  }) => {
    // Opening a new tab may cold-start the preview worker under CI load.
    test.slow();
    const modifier = await getNewTabModifier(page);
    const status = q.combobox("Status");
    await status.click();
    await test.expect(status).toHaveAttribute("aria-expanded", "true");
    await page.mouse.move(0, 0);
    await page.keyboard.press("d");
    await page.keyboard.press("Enter");
    await page.waitForURL(hasSearchParam("status", "draft"));
    await test.expect(status).toHaveText("Draft");
    await test.expect(status).toHaveAttribute("aria-expanded", "true");
    await test.expect(status).toBeFocused();
    await page.keyboard.press("PageDown");
    await test.expect(q.option("Archived")).toHaveAttribute("data-active-item");
    await test.expect(status).toBeFocused();

    const [newPage] = await Promise.all([
      page.context().waitForEvent("page"),
      browserName === "webkit"
        ? q.option("Archived").click({ modifiers: [modifier] })
        : page.keyboard.press(`${modifier}+Enter`),
    ]);

    await newPage.waitForURL(hasSearchParam("status", ["draft", "archived"]));
    await test
      .expect(query(newPage).combobox("Status"))
      .toHaveText("2 selected");
  });

  test("hydrates language and multiple statuses from the URL", async ({
    page,
    q,
  }) => {
    await page.goto(
      getNextjsUrl(page.url(), `/${id}?lang=fr&status=published&status=draft`),
    );
    await test.expect(q.combobox("Language")).toHaveText("French");
    await test.expect(q.combobox("Status")).toHaveText("2 selected");
    await q.combobox("Status").click();
    await test
      .expect(q.option("Draft"))
      .toHaveAttribute("aria-selected", "true");
    await test
      .expect(q.option("Published"))
      .toHaveAttribute("aria-selected", "true");
    await test
      .expect(q.option("Archived"))
      .toHaveAttribute("aria-selected", "false");
  });
});
