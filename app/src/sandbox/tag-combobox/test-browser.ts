import type { Locator } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

async function getSelectionText(locator: Locator) {
  return locator.evaluate((element) => {
    if (!(element instanceof HTMLInputElement)) return null;
    const start = element.selectionStart ?? 0;
    const end = element.selectionEnd ?? 0;
    return element.value.slice(start, end);
  });
}

async function getTagTexts(listbox: Locator) {
  return listbox.evaluate((element) => {
    const ids = element.getAttribute("aria-owns")?.split(/\s+/) ?? [];
    return ids.map((id) => document.getElementById(id)?.textContent?.trim());
  });
}

withFramework(import.meta.dirname, async ({ test }) => {
  test("renders the initial invitee", async ({ q }) => {
    await test.expect
      .poll(() => getTagTexts(q.listbox("Invitees")))
      .toEqual(["Abigail Patterson"]);
  });

  test("resets the value after selecting a suggestion", async ({ page, q }) => {
    const combobox = q.combobox("Invitees");
    await combobox.focus();
    await page.keyboard.type("bella");
    await test.expect(combobox).toHaveValue("bellawebb86@email.com");
    await page.keyboard.press("Enter");
    await test.expect
      .poll(() => getTagTexts(q.listbox("Invitees")))
      .toEqual(["Abigail Patterson", "Bella Webb"]);
    await test.expect(combobox).toHaveValue("");
  });

  test("preserves the input value when removing a tag", async ({ page, q }) => {
    const combobox = q.combobox("Invitees");
    await combobox.focus();
    await page.keyboard.type("a");
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("Backspace");
    await test.expect
      .poll(() => getTagTexts(q.listbox("Invitees")))
      .toEqual([]);
    await test.expect(combobox).toHaveValue("a");
  });

  test("resets suggestions after selecting a tag", async ({ page, q }) => {
    const combobox = q.combobox("Invitees");
    await combobox.focus();
    await page.keyboard.type("dan");
    await test
      .expect(q.option(/Daniel Green /))
      .toHaveAttribute("data-active-item");
    await page.keyboard.press("Enter");
    await test.expect
      .poll(() => getTagTexts(q.listbox("Invitees")))
      .toEqual(["Abigail Patterson", "Daniel Green"]);
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    const selected = q.option(/Abigail Patterson /);
    await test.expect(selected).toHaveAttribute("data-active-item");
    await test.expect(selected).toHaveAttribute("aria-selected", "true");
  });

  test("does not highlight text when deselecting a non-first item", async ({
    page,
    q,
  }) => {
    const combobox = q.combobox("Invitees");
    await combobox.focus();
    await page.keyboard.type("aid");
    await test.expect(combobox).toHaveValue("aidenfreeman91@email.com");
    await test
      .expect(q.option(/Aiden Freeman /))
      .toHaveAttribute("data-active-item");
    await test.expect
      .poll(() => getSelectionText(combobox))
      .toBe("enfreeman91@email.com");
    await page.keyboard.press("Enter");
    await test.expect
      .poll(() => getTagTexts(q.listbox("Invitees")))
      .toEqual(["Abigail Patterson", "Aiden Freeman"]);

    await page.keyboard.type("aid");
    await test.expect(combobox).toHaveValue("aid");
    await test.expect.poll(() => getSelectionText(combobox)).toBe("");
    const aiden = q.option(/Aiden Freeman /);
    await test.expect(aiden).toHaveAttribute("data-active-item");
    await test.expect(aiden).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("Enter");
    await test.expect
      .poll(() => getTagTexts(q.listbox("Invitees")))
      .toEqual(["Abigail Patterson"]);
    await test.expect(combobox).toHaveValue("");
    await test.expect(aiden).toHaveAttribute("data-active-item");
    await test.expect(aiden).toHaveAttribute("aria-selected", "false");

    await page.keyboard.press("ArrowUp");
    const abigail = q.option(/Abigail Rivera /);
    await test.expect(combobox).toHaveValue("abigailrivera35@email.com");
    await test.expect(abigail).toHaveAttribute("data-active-item");
    await test.expect(abigail).toHaveAttribute("aria-selected", "false");
    await page.keyboard.press("ArrowDown");
    await test.expect(combobox).toHaveValue("aidenfreeman91@email.com");
    await test.expect.poll(() => getSelectionText(combobox)).toBe("");
    await test.expect(aiden).toHaveAttribute("data-active-item");
    await test.expect(aiden).toHaveAttribute("aria-selected", "false");
  });
});
