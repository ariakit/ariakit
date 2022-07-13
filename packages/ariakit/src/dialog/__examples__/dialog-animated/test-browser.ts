import { Page, expect, test } from "@playwright/test";

const getDialog = (page: Page) => page.locator("role=dialog[name='Apples']");
const getButton = (page: Page, name: string) =>
  page.locator(`role=button[name='${name}']`);

const createTransition = (duration = 100) => {
  const then = performance.now();
  const isPending = () => {
    const now = performance.now();
    return now - then < duration;
  };
  return isPending;
};

test("show/hide", async ({ page }) => {
  await page.goto("/examples/dialog-animated");
  await expect(getDialog(page)).not.toBeVisible();
  const isEntering = createTransition();
  await getButton(page, "View details").click();
  await expect(getDialog(page)).toBeVisible();
  if (isEntering()) {
    await expect(getButton(page, "View details")).toBeFocused();
  }
  await expect(getButton(page, "Dismiss popup")).toBeFocused();
  const isLeaving = createTransition();
  await getButton(page, "Dismiss popup").click();
  await expect(getButton(page, "View details")).toBeFocused();
  if (isLeaving()) {
    await expect(getDialog(page)).toBeVisible();
  }
  await expect(getDialog(page)).not.toBeVisible();
});
