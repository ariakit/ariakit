import type { Page } from "@ariakit/test/playwright";
import { expect, query } from "@ariakit/test/playwright";
import { test } from "../test-utils.ts";

function dialogCalled(page: Page) {
  const state = {
    calledTimes: 0,
  };

  page.on("dialog", async (dialog) => {
    state.calledTimes++;
    await dialog.accept();
  });

  return state;
}

test("moving to checked native radio does not trigger alert/onChange", async ({
  page,
}) => {
  const q = query(query(page).radiogroup("Native"));
  const dialog = dialogCalled(page);
  await q.radio("apple").click();
  expect(dialog.calledTimes).toBe(1);
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  expect(dialog.calledTimes).toBe(3);
  await page.keyboard.press("Tab");
  await page.keyboard.press("Shift+Tab");
  expect(dialog.calledTimes).toBe(3);
});

test("clicking on checked custom radio does not trigger alert/onChange", async ({
  page,
}) => {
  const q = query(query(page).radiogroup("Custom"));
  const dialog = dialogCalled(page);
  await q.radio("apple").click();
  expect(dialog.calledTimes).toBe(1);
  await q.radio("apple").click();
  expect(dialog.calledTimes).toBe(1);
});
