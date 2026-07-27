import { expect } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("opens with click and clears the active item while closing", async ({
    page,
    q,
  }) => {
    const dialog = page.getByRole("dialog", {
      name: "Command Menu",
      includeHidden: true,
    });
    await expect(dialog).not.toBeAttached();
    await q.button("Open Command Menu").click();
    await expect(dialog).toBeVisible();
    await expect(q.combobox("Search for apps and commands...")).toBeFocused();
    await expect(q.option("Search Contacts")).toHaveAttribute(
      "data-active-item",
    );
    await expect(q.group("Suggestions")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(
      page.getByRole("option", {
        name: "Search Contacts",
        includeHidden: true,
      }),
    ).not.toHaveAttribute("data-active-item");
    await expect(q.button("Open Command Menu")).toBeFocused();
    await expect(dialog).not.toBeAttached();
  });

  test("outside dismissal clears the active item without restoring focus", async ({
    page,
    q,
  }) => {
    await q.button("Open Command Menu").click();
    await expect(q.combobox("Search for apps and commands...")).toBeFocused();
    await page.mouse.click(1, 1);
    await expect(
      page.getByRole("option", {
        name: "Search Contacts",
        includeHidden: true,
      }),
    ).not.toHaveAttribute("data-active-item");
    await expect(q.dialog("Command Menu")).not.toBeAttached();
  });

  test("keyboard disclosure and Esc button close the menu", async ({
    page,
    q,
  }) => {
    await q.button("Open Command Menu").focus();
    await page.keyboard.press("Enter");
    await expect(q.combobox("Search for apps and commands...")).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(q.button("Esc")).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(q.dialog("Command Menu")).not.toBeAttached();
  });

  test("keyboard and pointer navigation retain combobox focus", async ({
    page,
    q,
  }) => {
    await q.button("Open Command Menu").click();
    await expect(q.option("Search Contacts")).toHaveAttribute(
      "data-active-item",
    );
    await page.keyboard.press("ArrowDown");
    await expect(q.option("Improve Writing")).toHaveAttribute(
      "data-active-item",
    );
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("ArrowUp");
    await expect(q.option("Search Contacts")).toHaveAttribute(
      "data-active-item",
    );
    await expect(q.combobox()).toBeFocused();
    await q.option("My Schedule").hover();
    await expect(q.option("My Schedule")).toHaveAttribute("data-active-item");
    await expect(q.combobox()).toBeFocused();
    await page.mouse.move(10, 10);
    await expect(q.option("My Schedule")).toHaveAttribute("data-active-item");
    await q.combobox().click();
    await expect(q.option("My Schedule")).toHaveAttribute("data-active-item");
  });

  test("filters and resets the command results", async ({ page, q }) => {
    await q.button("Open Command Menu").click();
    await page.keyboard.type("se");
    await expect(q.group("Results")).toBeVisible();
    await expect(q.option("Search AI Commands")).toHaveAttribute(
      "data-active-item",
    );
    await page.keyboard.type("l");
    await expect(page.getByRole("option")).toHaveCount(2);
    await expect(q.option("Fix Spelling and Grammar")).toHaveAttribute(
      "data-active-item",
    );
    await page.keyboard.type("ec");
    await expect(page.getByRole("option")).toHaveCount(0);
    await expect(q.text("No results found")).toBeVisible();
    await page.keyboard.press("Backspace");
    await page.keyboard.press("Backspace");
    await page.keyboard.press("Backspace");
    await page.keyboard.press("Backspace");
    await page.keyboard.press("Backspace");
    await expect(q.option("Search Contacts")).toHaveAttribute(
      "data-active-item",
    );
  });
});
