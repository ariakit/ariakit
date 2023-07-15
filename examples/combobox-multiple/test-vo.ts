import { voTest as test } from "@guidepup/playwright";
import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";

const getCombobox = (page: Page) => page.getByRole("combobox");

test.beforeEach(async ({ page }) => {
  await page.goto("/previews/combobox-multiple", { waitUntil: "networkidle" });
});

test("navigate to listbox and select an item", async ({
  page,
  voiceOver: vo,
}) => {
  await getCombobox(page).focus();
  await page.keyboard.press("ArrowDown");
  await vo.next();
  expect(await vo.itemText()).toBe("list box");
  expect(await vo.lastSpokenPhrase()).toContain(
    "1 item selected. Bacon selected (2 of 34)",
  );
  await vo.interact();
  expect(await vo.itemText()).toBe("Bacon selected");
  await vo.stopInteracting();
  expect(await vo.itemText()).toBe("list box");
  await vo.interact();
  expect(await vo.itemText()).toBe("Bacon selected");
  await vo.press("ArrowDown");
  expect(await vo.itemText()).toBe("Banana");
  await vo.act();
  expect(await vo.lastSpokenPhrase()).toBe(
    "Banana added to selection 2 items selected",
  );
  await vo.type("gr");
  expect(await vo.itemText()).toContain("gr Your favorite food list box");
  await vo.next();
  await vo.interact();
  await vo.next();
  expect(await vo.itemText()).toBe("Green apple");
  await vo.act();
  expect(await vo.lastSpokenPhrase()).toContain("3 items selected");
  await vo.stopInteracting();
  expect(await vo.lastSpokenPhrase()).toContain(
    "3 items selected. Bacon selected (2 of 34) Banana selected (3 of 34) Green apple selected (17 of 34)",
  );
});
