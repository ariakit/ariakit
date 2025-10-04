import type { Page } from "@ariakit/test/playwright";
import { expect, query } from "@ariakit/test/playwright";
import { test } from "../test-utils.ts";

const getClickModifier = async (page: Page) => {
  const isMac = await page.evaluate(() => navigator.platform.startsWith("Mac"));
  return isMac ? "Meta" : "Control";
};

test("click on link with mouse", async ({ page }) => {
  const q = query(page);
  await q.combobox("Links").click();
  await expect(q.listbox()).toBeVisible();
  await q.option("Ariakit.org").click();
  await expect(page).toHaveURL(/https:\/\/ariakit\.org/);
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
  if (browserName === "webkit") {
    await q.option("Ariakit.org").click({ button: "middle" });
    await expect(page).toHaveURL(/https:\/\/ariakit\.org/);
  } else {
    const [newPage] = await Promise.all([
      context.waitForEvent("page"),
      q.option("Ariakit.org").click({ button: "middle" }),
    ]);
    await expect(q.listbox()).toBeVisible();
    await expect(q.combobox("Links")).toHaveValue("");
    await expect(newPage).toHaveURL(/https:\/\/ariakit\.org/);
  }
});

test("click on link with cmd/ctrl", async ({ page, context }) => {
  const q = query(page);
  await q.combobox("Links").click();
  await expect(q.listbox()).toBeVisible();
  const modifier = await getClickModifier(page);
  const [newPage] = await Promise.all([
    context.waitForEvent("page"),
    q.option("Ariakit.org").click({ modifiers: [modifier] }),
  ]);
  await expect(q.listbox()).toBeVisible();
  await expect(q.combobox("Links")).toHaveValue("");
  await expect(newPage).toHaveURL(/https:\/\/ariakit\.org/);
});

test("click on link with cmd/ctrl + enter", async ({
  page,
  context,
  browserName,
}) => {
  const q = query(page);
  await q.combobox("Links").click();
  await expect(q.listbox()).toBeVisible();
  const modifier = await getClickModifier(page);
  await page.keyboard.press("ArrowUp");
  if (browserName === "webkit") {
    // Safari doesn't support Cmd+Enter to open a link in a new tab
    // programmatically.
    await expect(async () => {
      await page.keyboard.press(`${modifier}+Enter`);
      await expect(page).toHaveURL(/https:\/\/ariakit\.org/);
    }).toPass();
  } else {
    const [newPage] = await Promise.all([
      context.waitForEvent("page"),
      page.keyboard.press(`${modifier}+Enter`),
    ]);
    await expect(q.listbox()).toBeVisible();
    await expect(q.combobox("Links")).toHaveValue("");
    await expect(newPage).toHaveURL(/https:\/\/ariakit\.org/);
  }
});

test("click on target blank link", async ({ page, context }) => {
  const q = query(page);
  await q.combobox("Links").click();
  await expect(q.listbox()).toBeVisible();
  await expect(q.combobox("Links")).toHaveValue("");
  const [newPage] = await Promise.all([
    context.waitForEvent("page"),
    q.option("Bluesky Opens in New Tab").click(),
  ]);
  await expect(q.listbox()).not.toBeVisible();
  await expect(q.combobox("Links")).toHaveValue("");
  await expect(newPage).toHaveURL(/https:\/\/bsky\.app/);
});

test("https://github.com/ariakit/ariakit/issues/2056", async ({ page }) => {
  const q = query(page);
  await q.combobox("Links").click();
  await expect(q.listbox()).toBeVisible();
  // Hover here is important to reproduce the issue.
  await q.option("Ariakit.org").hover();
  // Position the page so that the link is not fully visible.
  await page.evaluate(() => window.scrollTo({ top: 440 }));
  await q.option("Ariakit.org").click();
  await expect(page).toHaveURL(/https:\/\/ariakit\.org/);
});
