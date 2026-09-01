import type { Page } from "@ariakit/test/playwright";
import { expect } from "@ariakit/test/playwright";
import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  const getClickModifier = async (page: Page) => {
    const isMac = await page.evaluate(() =>
      navigator.platform.startsWith("Mac"),
    );
    return isMac ? "Meta" : "Control";
  };

  test("click on link with mouse", async ({ page, q }) => {
    await q.combobox("Links").click();
    await expect(q.listbox()).toBeVisible();
    await q.option("Ariakit.com").click();
    await expect(page).toHaveURL(/https:\/\/ariakit\.com/);
  });

  test("click on link with middle button", async ({
    page,
    q,
    context,
    browserName,
  }) => {
    await q.combobox("Links").click();
    await expect(q.listbox()).toBeVisible();
    await expect(q.combobox("Links")).toHaveValue("");
    if (browserName === "webkit") {
      await q.option("Ariakit.com").click({ button: "middle" });
      await expect(page).toHaveURL(/https:\/\/ariakit\.com/);
    } else {
      const [newPage] = await Promise.all([
        context.waitForEvent("page"),
        q.option("Ariakit.com").click({ button: "middle" }),
      ]);
      await expect(q.listbox()).toBeVisible();
      await expect(q.combobox("Links")).toHaveValue("");
      await expect(newPage).toHaveURL(/https:\/\/ariakit\.com/);
    }
  });

  test("click on link with cmd/ctrl", async ({ page, q, context }) => {
    await q.combobox("Links").click();
    await expect(q.listbox()).toBeVisible();
    const modifier = await getClickModifier(page);
    const [newPage] = await Promise.all([
      context.waitForEvent("page"),
      q.option("Ariakit.com").click({ modifiers: [modifier] }),
    ]);
    await expect(q.listbox()).toBeVisible();
    await expect(q.combobox("Links")).toHaveValue("");
    await expect(newPage).toHaveURL(/https:\/\/ariakit\.com/);
  });

  test("click on link with cmd/ctrl + enter", async ({
    page,
    q,
    context,
    browserName,
  }) => {
    // Chrome and Firefox can take a while to materialize the modifier+Enter
    // tab under CI load.
    test.slow();
    const combobox = q.combobox("Links");
    await combobox.click();
    await expect(q.listbox()).toBeVisible();
    const modifier = await getClickModifier(page);
    await page.mouse.move(0, 0);
    await expect(combobox).toBeFocused();
    await page.keyboard.press("ArrowUp");
    await expect(q.option("Ariakit.com")).toHaveAttribute("data-active-item");
    if (browserName === "webkit") {
      // Safari doesn't support Cmd+Enter to open a link in a new tab
      // programmatically.
      await expect(async () => {
        await page.keyboard.press(`${modifier}+Enter`);
        await expect(page).toHaveURL(/https:\/\/ariakit\.com/);
      }).toPass();
    } else {
      // Keep the page-event deadline inside the 90-second slow-test budget so
      // a missing tab names the event instead of timing out the whole test.
      const newPagePromise = context.waitForEvent("page", {
        timeout: 60_000,
      });
      await page.keyboard.down(modifier);
      try {
        await combobox.press("Enter");
      } finally {
        await page.keyboard.up(modifier);
      }
      const newPage = await newPagePromise;
      await expect(q.listbox()).toBeVisible();
      await expect(q.combobox("Links")).toHaveValue("");
      await expect(newPage).toHaveURL(/https:\/\/ariakit\.com/);
    }
  });

  test("click on target blank link", async ({ q, context }) => {
    // Keep popup creation independent of the external site's availability.
    await context.route(
      "https://bsky.app/profile/ariakit.com",
      (route) => route.fulfill({ body: "" }),
      { times: 1 },
    );
    await q.combobox("Links").click();
    await expect(q.listbox()).toBeVisible();
    await expect(q.combobox("Links")).toHaveValue("");
    const [newPage] = await Promise.all([
      context.waitForEvent("page"),
      q.option("Bluesky Opens in New Tab").click(),
    ]);
    await expect(q.listbox()).not.toBeVisible();
    await expect(q.combobox("Links")).toHaveValue("");
    await expect(newPage).toHaveURL("https://bsky.app/profile/ariakit.com");
  });

  test("https://github.com/ariakit/ariakit/issues/2056", async ({
    page,
    q,
  }) => {
    await q.combobox("Links").click();
    await expect(q.listbox()).toBeVisible();
    // Hover here is important to reproduce the issue.
    await q.option("Ariakit.com").hover();
    // Position the page so that the link is not fully visible.
    await page.evaluate(() => window.scrollTo({ top: 440 }));
    await q.option("Ariakit.com").click();
    await expect(page).toHaveURL(/https:\/\/ariakit\.com/);
  });
});
