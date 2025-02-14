import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { test } from "../test-utils.ts";

const getDialog = (page: Page) => page.getByRole("dialog", { name: "Success" });
const getButton = (page: Page, name: string) =>
  page.getByRole("button", { name });

const createTransition = (duration = 100) => {
  const then = performance.now();
  const isPending = () => {
    const now = performance.now();
    return now - then < duration;
  };
  return isPending;
};

test("show/hide", async ({ page }) => {
  await expect(getDialog(page)).not.toBeVisible();
  await getButton(page, "Show modal").click();
  await expect(getDialog(page)).toBeVisible();
  await expect(getButton(page, "OK")).toBeFocused();
  const isLeaving = createTransition();
  await getButton(page, "OK").click();
  await expect(getButton(page, "Show modal")).toBeFocused();
  if (isLeaving()) {
    await expect(getDialog(page)).toBeVisible();
  }
  await expect(getDialog(page)).not.toBeVisible();
});
