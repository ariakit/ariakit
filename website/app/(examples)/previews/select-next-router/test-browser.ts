import { query } from "@ariakit/test/playwright";
import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { test } from "../../../../../examples/test-utils.ts";

async function getNewTabModifier(page: Page) {
  const isMac = await page.evaluate(() => navigator.platform.startsWith("Mac"));
  return isMac ? "Meta" : "Control";
}

function hasSearchParam(name: string, value: string | string[]) {
  return (url: URL) => {
    const values = Array.isArray(value) ? value : [value];
    return values.every((v) => url.searchParams.has(name, v));
  };
}

test("default language", async ({ page }) => {
  const q = query(page);
  await expect(q.combobox("Language")).toHaveText("English");
});

test("default status", async ({ page }) => {
  const q = query(page);
  await expect(q.combobox("Status")).toHaveText("Any");
});

test("select a language from the dropdown using a mouse", async ({ page }) => {
  const q = query(page);
  await q.combobox("Language").click();
  await q.option("French").click();
  await page.waitForURL(hasSearchParam("lang", "fr"));
  await expect(q.combobox("Language")).toHaveText("French");
});

test("select a language from the dropdown using the keyboard", async ({
  page,
}) => {
  const q = query(page);
  await q.combobox("Language").click();
  await expect(q.option("English")).toHaveAttribute("data-active-item");
  await page.keyboard.press("PageDown");
  await expect(q.option("German")).toHaveAttribute("data-active-item");
  await page.keyboard.press("Space");
  await page.waitForURL(hasSearchParam("lang", "de"));
  await expect(q.combobox("Language")).toHaveText("German");
});

test("select a language using the URL", async ({ page }) => {
  await page.goto("/previews/select-next-router?lang=fr", {
    waitUntil: "networkidle",
  });
  const q = query(page);
  await expect(q.combobox("Language")).toHaveText("French");
});

test("select a language then navigate through the browser history", async ({
  page,
}) => {
  const q = query(page);
  await q.combobox("Language").click();
  await q.option("French").click();
  await page.waitForURL(hasSearchParam("lang", "fr"));
  await expect(q.combobox("Language")).toHaveText("French");
  await page.goBack();
  await page.waitForURL((url) => url.search === "");
  await expect(q.combobox("Language")).toHaveText("English");
  await page.goForward();
  await page.waitForURL(hasSearchParam("lang", "fr"));
  await expect(q.combobox("Language")).toHaveText("French");
});

test("select a language by opening link in a new tab with a mouse", async ({
  page,
}) => {
  const q = query(page);
  await q.combobox("Language").click();

  const modifier = await getNewTabModifier(page);

  const [newPage] = await Promise.all([
    page.context().waitForEvent("page"),
    q.option("French").click({ modifiers: [modifier] }),
  ]);

  await newPage.waitForURL(hasSearchParam("lang", "fr"));
  await expect(query(newPage).combobox("Language")).toHaveText("French");

  const url = new URL(page.url());
  expect(url.searchParams.get("lang")).toBeNull();
  await expect(q.combobox("Language")).toHaveText("English");
});

test("select statuses with a mouse", async ({ page }) => {
  const q = query(page);
  await q.combobox("Status").click();

  await q.option("Published").click();
  await page.waitForURL(hasSearchParam("status", "published"));
  await expect(q.combobox("Status")).toHaveText("Published");

  await q.option("Draft").click();
  await page.waitForURL(hasSearchParam("status", ["draft", "published"]));
  await expect(q.combobox("Status")).toHaveText("2 selected");

  await q.option("Archived").click();
  await page.waitForURL(
    hasSearchParam("status", ["draft", "published", "archived"]),
  );
  await expect(q.combobox("Status")).toHaveText("3 selected");

  await q.option("published").click();
  await page.waitForURL(hasSearchParam("status", ["draft", "archived"]));
  await expect(q.combobox("Status")).toHaveText("2 selected");
});

test("select statuses by opening link in a new tab with the keyboard", async ({
  page,
  browserName,
}) => {
  const q = query(page);
  const modifier = await getNewTabModifier(page);

  await q.combobox("Status").click();
  await expect(q.listbox("Status")).toBeFocused();

  await page.keyboard.press("d");
  await expect(q.option("Draft")).toHaveAttribute("data-active-item");

  await page.keyboard.press("Enter");
  await page.waitForURL(hasSearchParam("status", "draft"));
  await expect(q.combobox("Status")).toHaveText("Draft");

  await page.keyboard.press("PageDown");
  await expect(q.option("Archived")).toHaveAttribute("data-active-item");

  const [newPage] = await Promise.all([
    page.context().waitForEvent("page"),
    browserName === "webkit"
      ? q.option("Archived").click({ modifiers: [modifier] })
      : page.keyboard.press(`${modifier}+Enter`),
  ]);

  await newPage.waitForURL(hasSearchParam("status", ["draft", "archived"]));
  await expect(query(newPage).combobox("Status")).toHaveText("2 selected");
});

test("select language and statuses using the URL", async ({ page }) => {
  await page.goto(
    "/previews/select-next-router?lang=fr&status=published&status=draft",
    { waitUntil: "networkidle" },
  );

  const q = query(page);
  const modifier = await getNewTabModifier(page);

  await expect(q.combobox("Language")).toHaveText("French");
  await expect(q.combobox("Status")).toHaveText("2 selected");

  await q.combobox("Status").click();
  await expect(q.option("Draft")).toHaveAttribute("data-active-item");
  await expect(q.option("Draft")).toHaveAttribute("aria-selected", "true");
  await expect(q.option("Published")).toHaveAttribute("aria-selected", "true");
  await expect(q.option("Archived")).toHaveAttribute("aria-selected", "false");

  await q.option("Archived").click();
  await page.waitForURL(
    hasSearchParam("status", ["draft", "published", "archived"]),
  );
  await expect(q.combobox("Status")).toHaveText("3 selected");

  const [newPage] = await Promise.all([
    page.context().waitForEvent("page"),
    q.option("Published").click({ modifiers: [modifier] }),
  ]);

  await newPage.waitForURL(hasSearchParam("status", ["draft", "archived"]));
  await expect(query(newPage).combobox("Status")).toHaveText("2 selected");
});
