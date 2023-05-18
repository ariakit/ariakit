import { voTest as test } from "@guidepup/playwright";
import { expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/previews/combobox-multiple", { waitUntil: "networkidle" });
});

test("navigate to listbox and select an item", async ({ voiceOver: vo }) => {
  await vo.interact();
  await vo.next();
  await vo.press("ArrowDown");
  await vo.next();
  expect(await vo.itemText()).toBe("list box");
  expect(await vo.lastSpokenPhrase()).toContain(
    "1 item selected. Bacon selected (2 of"
  );
  await vo.interact();
  expect(await vo.itemText()).toBe("Bacon selected");
  await vo.press("ArrowDown");
  expect(await vo.itemText()).toBe("Banana");
  await vo.type("green");
  expect(await vo.itemText()).toBe("Green apple");
  await vo.act();
  expect(await vo.lastSpokenPhrase()).toBe(
    "Green apple added to selection 2 items selected"
  );
});
