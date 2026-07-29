import type { Page } from "@ariakit/test/playwright";
import { expect, query } from "@ariakit/test/playwright";
import type { BrowserContext, Locator } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

interface ExpectNewPageParams {
  action: () => Promise<void>;
  context: BrowserContext;
  timeout?: number;
  url: string;
}

async function prepareNavigation(page: Page, option: Locator, href: string) {
  await expect(option).toHaveAttribute("href", href);
  const url = new URL(page.url());
  url.searchParams.set("external-link", href);
  await option.evaluate((element, url) => {
    element.setAttribute("href", url);
  }, url.href);
  return url.href;
}

async function expectNewPage({
  action,
  context,
  timeout,
  url,
}: ExpectNewPageParams) {
  const [newPage] = await Promise.all([
    context.waitForEvent("page", { timeout }),
    action(),
  ]);
  try {
    await expect(newPage).toHaveURL(url);
  } finally {
    await newPage.close();
  }
}

withFramework(import.meta.dirname, async ({ test }) => {
  const getClickModifier = async (page: Page) => {
    const isMac = await page.evaluate(() =>
      navigator.platform.startsWith("Mac"),
    );
    return isMac ? "Meta" : "Control";
  };

  test("click on link with mouse", async ({ page }) => {
    const q = query(page);
    await q.combobox("Links").click();
    await expect(q.listbox()).toBeVisible();
    const option = q.option("Ariakit.com");
    const url = await prepareNavigation(page, option, "https://ariakit.com");
    await option.click();
    await expect(page).toHaveURL(url);
  });

  test("click on link with middle button", async ({
    page,
    context,
    browserName,
  }) => {
    const q = query(page);
    await q.combobox("Links").click();
    await expect(q.listbox()).toBeVisible();
    await expect(q.combobox("Links")).toHaveValue("");
    const option = q.option("Ariakit.com");
    const url = await prepareNavigation(page, option, "https://ariakit.com");
    if (browserName === "webkit") {
      await option.click({ button: "middle" });
      await expect(page).toHaveURL(url);
    } else {
      await expectNewPage({
        context,
        url,
        action: () => option.click({ button: "middle" }),
      });
      await expect(q.listbox()).toBeVisible();
      await expect(q.combobox("Links")).toHaveValue("");
    }
  });

  test("click on link with cmd/ctrl", async ({ page, context }) => {
    const q = query(page);
    await q.combobox("Links").click();
    await expect(q.listbox()).toBeVisible();
    const modifier = await getClickModifier(page);
    const option = q.option("Ariakit.com");
    const url = await prepareNavigation(page, option, "https://ariakit.com");
    await expectNewPage({
      context,
      url,
      action: () => option.click({ modifiers: [modifier] }),
    });
    await expect(q.listbox()).toBeVisible();
    await expect(q.combobox("Links")).toHaveValue("");
  });

  test("click on link with cmd/ctrl + enter", async ({
    page,
    context,
    browserName,
  }) => {
    // Chrome and Firefox can take a while to materialize the modifier+Enter
    // tab under CI load.
    test.slow();
    const q = query(page);
    const combobox = q.combobox("Links");
    await combobox.click();
    await expect(q.listbox()).toBeVisible();
    const modifier = await getClickModifier(page);
    await page.mouse.move(0, 0);
    await expect(combobox).toBeFocused();
    await page.keyboard.press("ArrowUp");
    const option = q.option("Ariakit.com");
    await expect(option).toHaveAttribute("data-active-item");
    const url = await prepareNavigation(page, option, "https://ariakit.com");
    if (browserName === "webkit") {
      // Safari doesn't support Cmd+Enter to open a link in a new tab
      // programmatically.
      await expect(async () => {
        await page.keyboard.press(`${modifier}+Enter`);
        await expect(page).toHaveURL(url);
      }).toPass();
    } else {
      await expectNewPage({
        context,
        timeout: 60_000,
        url,
        action: async () => {
          await page.keyboard.down(modifier);
          try {
            await combobox.press("Enter");
          } finally {
            await page.keyboard.up(modifier);
          }
        },
      });
      await expect(q.listbox()).toBeVisible();
      await expect(q.combobox("Links")).toHaveValue("");
    }
  });

  test("click on target blank link", async ({ page, context }) => {
    const q = query(page);
    await q.combobox("Links").click();
    await expect(q.listbox()).toBeVisible();
    await expect(q.combobox("Links")).toHaveValue("");
    const option = q.option("Bluesky Opens in New Tab");
    const url = await prepareNavigation(
      page,
      option,
      "https://bsky.app/profile/ariakit.com",
    );
    await expectNewPage({
      context,
      url,
      action: () => option.click(),
    });
    await expect(q.listbox()).not.toBeVisible();
    await expect(q.combobox("Links")).toHaveValue("");
  });

  test("https://github.com/ariakit/ariakit/issues/2056", async ({ page }) => {
    const q = query(page);
    await q.combobox("Links").click();
    await expect(q.listbox()).toBeVisible();
    // Hover here is important to reproduce the issue.
    await q.option("Ariakit.com").hover();
    // Position the page so that the link is not fully visible.
    await page.evaluate(() => window.scrollTo({ top: 440 }));
    const option = q.option("Ariakit.com");
    const url = await prepareNavigation(page, option, "https://ariakit.com");
    await option.click();
    await expect(page).toHaveURL(url);
  });
});
