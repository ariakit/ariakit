import { query } from "@ariakit/test/playwright";
import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { test } from "../test-utils.ts";

async function copy(page: Page, text: string) {
  await page.evaluate((text) => navigator.clipboard.writeText(text), text);
}

async function paste(page: Page) {
  const isMac = await page.evaluate(() => navigator.platform.startsWith("Mac"));
  const modifier = isMac ? "Meta" : "Control";
  await page.keyboard.press(`${modifier}+V`);
}

async function tags(page: Page) {
  const options = await page.getByRole("option").all();
  return Promise.all(options.map((el) => el.textContent()));
}

test.beforeEach(async ({ context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
});

test("paste tag without delimiters", async ({ page }) => {
  const q = query(page);
  await copy(page, "abc");
  await page.keyboard.press("Tab");
  await expect(q.textbox("Tags")).toBeFocused();
  await paste(page);
  await expect(q.textbox("Tags")).toBeFocused();
  await expect(q.textbox("Tags")).toHaveValue("abc");
  await expect(q.option("abc")).not.toBeVisible();
});

test("paste tag without delimiters from tag list", async ({ page }) => {
  const q = query(page);
  await copy(page, "abc");
  await page.keyboard.press("Tab");
  await page.keyboard.press("ArrowLeft");
  await paste(page);
  await expect(q.textbox("Tags")).toBeFocused();
  await expect(q.textbox("Tags")).toHaveValue("abc");
  await expect(q.option("abc")).not.toBeVisible();
});

test("paste tags with space", async ({ page }) => {
  const q = query(page);
  await copy(page, "abc def ghi");
  await page.keyboard.press("Tab");
  await paste(page);
  await expect(q.textbox("Tags")).toHaveValue("");
  await expect(q.textbox("Tags")).toBeFocused();
  expect(await tags(page)).toEqual([
    "JavaScript",
    "React",
    "abc",
    "def",
    "ghi",
  ]);
});

test("paste tags with space from tag list", async ({ page }) => {
  const q = query(page);
  await copy(page, "abc def ghi");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Home");
  await expect(q.option("JavaScript")).toBeFocused();
  await paste(page);
  await expect(q.textbox("Tags")).toHaveValue("");
  await expect(q.textbox("Tags")).toBeFocused();
  expect(await tags(page)).toEqual([
    "JavaScript",
    "React",
    "abc",
    "def",
    "ghi",
  ]);
});

test("paste tags with comma and space", async ({ page }) => {
  const q = query(page);
  await copy(page, "abc def, ghi");
  await page.keyboard.press("Tab");
  await paste(page);
  await expect(q.textbox("Tags")).toHaveValue("");
  await expect(q.textbox("Tags")).toBeFocused();
  expect(await tags(page)).toEqual(["JavaScript", "React", "abc def", "ghi"]);
});

test("paste tags with comma and space from tag list", async ({ page }) => {
  const q = query(page);
  await copy(page, "abc def, ghi");
  await page.keyboard.press("Tab");
  await page.keyboard.press("PageUp");
  await expect(q.option("JavaScript")).toBeFocused();
  await paste(page);
  await expect(q.textbox("Tags")).toHaveValue("");
  await expect(q.textbox("Tags")).toBeFocused();
  expect(await tags(page)).toEqual(["JavaScript", "React", "abc def", "ghi"]);
});

test("paste tags with semicolon, comma and space", async ({ page }) => {
  const q = query(page);
  await copy(page, "abc def, ghi; jkl");
  await page.keyboard.press("Tab");
  await paste(page);
  await expect(q.textbox("Tags")).toHaveValue("");
  await expect(q.textbox("Tags")).toBeFocused();
  expect(await tags(page)).toEqual([
    "JavaScript",
    "React",
    "abc def, ghi",
    "jkl",
  ]);
});

test("paste tags with semicolon, comma and space from tag list", async ({
  page,
}) => {
  const q = query(page);
  await copy(page, "abc def, ghi; jkl");
  await page.keyboard.press("Tab");
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowLeft");
  await expect(q.option("JavaScript")).toBeFocused();
  await paste(page);
  await expect(q.textbox("Tags")).toHaveValue("");
  await expect(q.textbox("Tags")).toBeFocused();
  expect(await tags(page)).toEqual([
    "JavaScript",
    "React",
    "abc def, ghi",
    "jkl",
  ]);
});

test("paste tags with a final newline", async ({ page }) => {
  const q = query(page);
  await copy(page, "abc, def\n");
  await page.keyboard.press("Tab");
  await paste(page);
  await expect(q.textbox("Tags")).toHaveValue("");
  await expect(q.textbox("Tags")).toBeFocused();
  expect(await tags(page)).toEqual(["JavaScript", "React", "abc", "def"]);
});
