import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

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

withFramework(import.meta.dirname, async ({ test, query }) => {
  test.beforeEach(async ({ context, browserName }) => {
    // Firefox rejects these permission names and WebKit doesn't need them,
    // which is why this is the only project that grants them. Chromium keeps
    // the explicit grant this file already had, rather than relying on its
    // automatic clipboard-write grant for a focused document.
    if (browserName !== "chromium") return;
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  });

  test("renders the tags inside the listbox and the input outside it", async ({
    q,
  }) => {
    await expect(q.listbox("Tags")).not.toHaveAttribute("aria-owns");
    const tagList = query(q.listbox("Tags"));
    await expect(tagList.option()).toHaveCount(2);
    // The listbox role accepts only options as children, so the input must be
    // a sibling of the tag list rather than a descendant of it.
    await expect(tagList.textbox()).toHaveCount(0);
    await expect(q.textbox("Tags")).toBeVisible();
  });

  test("focuses the input when clicking on the control", async ({
    page,
    q,
  }) => {
    // The tag list has a display: contents style and generates no box, so the
    // control is the element that receives clicks on the field's padding.
    const control = page.locator(".ak-tag-list");
    await control.click({ position: { x: 4, y: 4 } });
    await expect(q.textbox("Tags")).toBeFocused();
  });

  test("paste tag without delimiters", async ({ page, q }) => {
    await copy(page, "abc");
    await page.keyboard.press("Tab");
    await expect(q.textbox("Tags")).toBeFocused();
    await paste(page);
    await expect(q.textbox("Tags")).toBeFocused();
    await expect(q.textbox("Tags")).toHaveValue("abc");
    await expect(q.option("abc")).not.toBeVisible();
  });

  test("paste tag without delimiters from tag list", async ({ page, q }) => {
    await copy(page, "abc");
    await page.keyboard.press("Tab");
    await page.keyboard.press("ArrowLeft");
    await paste(page);
    await expect(q.textbox("Tags")).toBeFocused();
    await expect(q.textbox("Tags")).toHaveValue("abc");
    await expect(q.option("abc")).not.toBeVisible();
  });

  test("paste tags with space", async ({ page, q }) => {
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

  test("paste tags with space from tag list", async ({ page, q }) => {
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

  test("paste tags with comma and space", async ({ page, q }) => {
    await copy(page, "abc def, ghi");
    await page.keyboard.press("Tab");
    await paste(page);
    await expect(q.textbox("Tags")).toHaveValue("");
    await expect(q.textbox("Tags")).toBeFocused();
    expect(await tags(page)).toEqual(["JavaScript", "React", "abc def", "ghi"]);
  });

  test("paste tags with comma and space from tag list", async ({ page, q }) => {
    await copy(page, "abc def, ghi");
    await page.keyboard.press("Tab");
    await page.keyboard.press("PageUp");
    await expect(q.option("JavaScript")).toBeFocused();
    await paste(page);
    await expect(q.textbox("Tags")).toHaveValue("");
    await expect(q.textbox("Tags")).toBeFocused();
    expect(await tags(page)).toEqual(["JavaScript", "React", "abc def", "ghi"]);
  });

  test("paste tags with semicolon, comma and space", async ({ page, q }) => {
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
    q,
  }) => {
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

  test("paste tags with a final newline", async ({ page, q }) => {
    await copy(page, "abc, def\n");
    await page.keyboard.press("Tab");
    await paste(page);
    await expect(q.textbox("Tags")).toHaveValue("");
    await expect(q.textbox("Tags")).toBeFocused();
    expect(await tags(page)).toEqual(["JavaScript", "React", "abc", "def"]);
  });
});
