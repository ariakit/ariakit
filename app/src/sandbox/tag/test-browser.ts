import type { Locator, Page } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

async function getSelectionText(locator: Locator) {
  return locator.evaluate((element) => {
    if (!(element instanceof HTMLInputElement)) return null;
    const start = element.selectionStart ?? 0;
    const end = element.selectionEnd ?? 0;
    return element.value.slice(start, end);
  });
}

async function historyShortcut(page: Page, action: "undo" | "redo") {
  const platform = await page.evaluate(() => navigator.platform);
  const isApple = /mac|iphone|ipad|ipod/i.test(platform);
  const shortcut =
    action === "undo"
      ? isApple
        ? "Meta+z"
        : "Control+z"
      : isApple
        ? "Meta+Shift+z"
        : "Control+y";
  await page.keyboard.press(shortcut);
}

withFramework(import.meta.dirname, async ({ test }) => {
  test("renders the initial tags and textbox", async ({ q }) => {
    await test.expect(q.listbox("Tags")).toHaveCount(1);
    await test.expect(q.option()).toHaveCount(2);
    await test.expect(q.option("JavaScript")).toBeVisible();
    await test.expect(q.option("React")).toBeVisible();
    await test.expect(q.textbox("Tags")).toBeVisible();
  });

  test("focuses a clicked tag", async ({ q }) => {
    await q.option("JavaScript").click({ position: { x: 2, y: 2 } });
    await test.expect(q.option("JavaScript")).toBeFocused();
  });

  test("removes a tag with its remove button", async ({ q }) => {
    const tag = q.option("JavaScript");
    await tag.locator('[aria-label^="Press"]').click();
    await test.expect(q.textbox("Tags")).toBeFocused();
    await test.expect(tag).toHaveCount(0);
  });

  test("removes tags with Delete and Backspace", async ({ page, q }) => {
    await q.option("JavaScript").click({ position: { x: 2, y: 2 } });
    await page.keyboard.press("Delete");
    await test.expect(q.option("React")).toBeFocused();
    await test.expect(q.option("JavaScript")).toHaveCount(0);

    await page.reload();
    await q.option("React").click({ position: { x: 2, y: 2 } });
    await page.keyboard.press("Backspace");
    await test.expect(q.option("JavaScript")).toBeFocused();
    await test.expect(q.option("React")).toHaveCount(0);
  });

  test("removes the last tag with Backspace from the textbox", async ({
    page,
    q,
  }) => {
    const textbox = q.textbox("Tags");
    await textbox.click();
    await page.keyboard.press("Backspace");
    await test.expect(textbox).toBeFocused();
    await test.expect(q.option("React")).toHaveCount(0);
    await test.expect(q.option("JavaScript")).toBeVisible();
  });

  test("adds tags by typing delimiters and moves focus", async ({
    page,
    q,
  }) => {
    const textbox = q.textbox("Tags");
    await textbox.focus();
    await page.keyboard.type("abc ");
    await test.expect(textbox).toHaveValue("");
    await page.keyboard.type("def, ghi;");
    await test.expect(q.option()).toHaveCount(5);
    await test.expect(q.option("abc")).toBeVisible();
    await test.expect(q.option("def")).toBeVisible();
    await test.expect(q.option("ghi")).toBeVisible();
    await test.expect(textbox).toBeFocused();
    await test.expect(textbox).toHaveValue("");

    await page.keyboard.press("ArrowLeft");
    await test.expect(q.option("ghi")).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await test.expect(q.option("def")).toBeFocused();
    await page.keyboard.press("Home");
    await test.expect(q.option("JavaScript")).toBeFocused();
    await page.keyboard.press("End");
    await test.expect(textbox).toBeFocused();
  });

  test("adds a tag after inserting a delimiter into existing text", async ({
    page,
    q,
  }) => {
    const textbox = q.textbox("Tags");
    await textbox.focus();
    await page.keyboard.type(", ghi");
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press("ArrowLeft");
    }
    await page.keyboard.type("abc def");
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press("ArrowRight");
    }
    await page.keyboard.type(",");
    await test
      .expect(q.option())
      .toHaveText(["JavaScript", "React", "abc def", "ghi"]);
  });

  test("moves focus through tags and selects input text", async ({
    page,
    q,
  }) => {
    const textbox = q.textbox("Tags");
    await textbox.focus();
    await page.keyboard.press("ArrowLeft");
    await test.expect(q.option("React")).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await test.expect(q.option("JavaScript")).toBeFocused();

    await page.keyboard.type("TypeScript");
    await test.expect(textbox).toBeFocused();
    await test.expect(textbox).toHaveValue("TypeScript");
    await page.keyboard.press("Home");
    await test.expect(q.option("JavaScript")).toBeFocused();
    await page.keyboard.press("End");
    await test.expect(textbox).toBeFocused();
    await test.expect.poll(() => getSelectionText(textbox)).toBe("TypeScript");
    await page.keyboard.press("ArrowLeft");
    await test.expect(q.option("React")).toBeFocused();
    await page.keyboard.press("ArrowUp");
    await test.expect(q.option("JavaScript")).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await test.expect(q.option("JavaScript")).toBeFocused();
  });

  test("undoes and redoes removing tags", async ({ page, q }) => {
    const textbox = q.textbox("Tags");
    await q.option("React").locator('[aria-label^="Press"]').click();
    await test.expect(q.option()).toHaveText(["JavaScript"]);
    await historyShortcut(page, "undo");
    await test.expect(q.option()).toHaveText(["JavaScript", "React"]);
    await test.expect(textbox).toBeFocused();

    await page.keyboard.press("Home");
    await page.keyboard.press("Delete");
    await test.expect(q.option()).toHaveText(["React"]);
    await historyShortcut(page, "undo");
    await test.expect(q.option()).toHaveText(["JavaScript", "React"]);
    await historyShortcut(page, "redo");
    await test.expect(q.option()).toHaveText(["React"]);
    await test.expect(textbox).toBeFocused();
  });

  test("undoes and redoes typing tags", async ({ page, q }) => {
    const textbox = q.textbox("Tags");
    await textbox.focus();
    await page.keyboard.type("abc def ghi ");
    await test
      .expect(q.option())
      .toHaveText(["JavaScript", "React", "abc", "def", "ghi"]);
    await page.keyboard.press("Backspace");
    await page.keyboard.press("Backspace");
    await test.expect(q.option()).toHaveText(["JavaScript", "React", "abc"]);

    await historyShortcut(page, "undo");
    await test
      .expect(q.option())
      .toHaveText(["JavaScript", "React", "abc", "def"]);
    await historyShortcut(page, "undo");
    await test
      .expect(q.option())
      .toHaveText(["JavaScript", "React", "abc", "def", "ghi"]);
    await historyShortcut(page, "undo");
    await test
      .expect(q.option())
      .toHaveText(["JavaScript", "React", "abc", "def"]);
    await test.expect(textbox).toHaveValue("ghi");

    await page.keyboard.type("jkl ");
    await test
      .expect(q.option())
      .toHaveText(["JavaScript", "React", "abc", "def", "ghijkl"]);
    await historyShortcut(page, "redo");
    await test
      .expect(q.option())
      .toHaveText(["JavaScript", "React", "abc", "def", "ghijkl"]);
    await test.expect(textbox).toHaveValue("");

    await historyShortcut(page, "undo");
    await test
      .expect(q.option())
      .toHaveText(["JavaScript", "React", "abc", "def"]);
    await test.expect(textbox).toHaveValue("ghijkl");
    await historyShortcut(page, "undo");
    await test.expect(textbox).toHaveValue("ghi");
    await historyShortcut(page, "undo");
    await test.expect(q.option()).toHaveText(["JavaScript", "React", "abc"]);
    await test.expect(textbox).toHaveValue("def");

    await historyShortcut(page, "redo");
    await test
      .expect(q.option())
      .toHaveText(["JavaScript", "React", "abc", "def"]);
    await test.expect(textbox).toHaveValue("ghi ");
    await historyShortcut(page, "redo");
    await test.expect(textbox).toHaveValue("ghijkl ");
    await historyShortcut(page, "redo");
    await test
      .expect(q.option())
      .toHaveText(["JavaScript", "React", "abc", "def", "ghijkl"]);
    await test.expect(textbox).toHaveValue("");
  });
});
