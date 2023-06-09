import type { Locator, Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

const getButton = (page: Page | Locator, name: string) =>
  page.getByRole("button", { name, exact: true });

const getAccessibleDialog = (page: Page | Locator, name: string) =>
  page.getByRole("dialog", { name, exact: true });

const getDialog = (page: Page | Locator, name: string) =>
  page.getByRole("dialog", { includeHidden: true, name, exact: true });

function expectAccessibleDialog(
  page: Page | Locator,
  name: string,
  toBeVisible: boolean
) {
  const dialog = getAccessibleDialog(page, name);
  if (toBeVisible) {
    return expect(dialog).toBeVisible();
  }
  return expect(dialog).not.toBeVisible({ visible: false });
}

async function canScrollBody(page: Page) {
  await page.mouse.move(1, 1);
  const scrollY = await page.evaluate(() => window.scrollY);
  await page.mouse.wheel(0, 100);
  await page.waitForTimeout(100);
  const scrollY2 = await page.evaluate(() => window.scrollY);
  return scrollY !== scrollY2;
}

test.beforeEach(async ({ page }) => {
  await page.goto("/previews/dialog-nested-multiple", {
    waitUntil: "networkidle",
  });
});

for (const { name, type } of [
  { name: "nested", type: "" },
  { name: "sibling", type: "" },
  { name: "nested", type: " unmount" },
  { name: "sibling", type: " unmount" },
  { name: "nested", type: " no portal" },
  { name: "sibling", type: " no portal" },
  { name: "nested", type: " no portal portal" },
  { name: "sibling", type: " no portal portal" },
  { name: "nested", type: " no backdrop" },
  { name: "sibling", type: " no backdrop" },
]) {
  test(`hide ${name}${type} dialog by pressing Escape`, async ({ page }) => {
    await getButton(page, "Open dialog").click();
    await getButton(page, `${name}${type}`).click();
    await getButton(page, `${name}${type} ${name}`).click();
    await expect(getDialog(page, "Dialog")).toBeVisible();
    await expect(getDialog(page, `${name}${type}`)).toBeVisible();
    await expect(getDialog(page, `${name}${type} ${name}`)).toBeVisible();
    await expectAccessibleDialog(page, "Dialog", false);
    await expectAccessibleDialog(page, `${name}${type}`, false);
    await expectAccessibleDialog(page, `${name}${type} ${name}`, true);
    await expect(canScrollBody(page)).resolves.toBe(false);
    await page.keyboard.press("Escape");
    await expect(getDialog(page, `${name}${type} ${name}`)).not.toBeVisible();
    await expect(getDialog(page, `${name}${type}`)).toBeVisible();
    await expectAccessibleDialog(page, "Dialog", false);
    await expectAccessibleDialog(page, `${name}${type}`, true);
    await expect(canScrollBody(page)).resolves.toBe(false);
    await page.keyboard.press("Escape");
    await expect(getDialog(page, `${name}${type}`)).not.toBeVisible();
    await expect(getDialog(page, "Dialog")).toBeVisible();
    await expectAccessibleDialog(page, "Dialog", true);
    await expect(canScrollBody(page)).resolves.toBe(false);
    await page.keyboard.press("Escape");
    await expect(getButton(page, "Open dialog")).toBeFocused();
    await expect(getDialog(page, "Dialog")).not.toBeVisible();
    await expect(canScrollBody(page)).resolves.toBe(true);
  });
}

for (const { name, type } of [
  { name: "nested", type: "" },
  { name: "sibling", type: "" },
  { name: "nested", type: " unmount" },
  { name: "sibling", type: " unmount" },
  { name: "nested", type: " no portal" },
  { name: "sibling", type: " no portal" },
  { name: "nested", type: " no portal portal" },
  { name: "sibling", type: " no portal portal" },
]) {
  test(`hide ${name}${type} dialog by clicking outside`, async ({ page }) => {
    await getButton(page, "Open dialog").click();
    await getButton(page, `${name}${type}`).click();
    await getButton(page, `${name}${type} ${name}`).click();
    await expect(getDialog(page, "Dialog")).toBeVisible();
    await expect(getDialog(page, `${name}${type}`)).toBeVisible();
    await expect(getDialog(page, `${name}${type} ${name}`)).toBeVisible();
    await expectAccessibleDialog(page, "Dialog", false);
    await expectAccessibleDialog(page, `${name}${type}`, false);
    await expectAccessibleDialog(page, `${name}${type} ${name}`, true);
    await expect(canScrollBody(page)).resolves.toBe(false);
    await page.mouse.click(1, 1);
    await expect(getDialog(page, `${name}${type} ${name}`)).not.toBeVisible();
    await expect(getDialog(page, `${name}${type}`)).toBeVisible();
    await expectAccessibleDialog(page, "Dialog", false);
    await expectAccessibleDialog(page, `${name}${type}`, true);
    await expect(canScrollBody(page)).resolves.toBe(false);
    await page.mouse.click(1, 1);
    await expect(getDialog(page, `${name}${type}`)).not.toBeVisible();
    await expect(getDialog(page, "Dialog")).toBeVisible();
    await expectAccessibleDialog(page, "Dialog", true);
    await expect(canScrollBody(page)).resolves.toBe(false);
    await page.mouse.click(1, 1);
    await expect(getButton(page, "Open dialog")).toBeFocused();
    await expect(getDialog(page, "Dialog")).not.toBeVisible();
    await expect(canScrollBody(page)).resolves.toBe(true);
  });
}

for (const name of ["nested", "sibling"]) {
  test(`hide all ${name} no backdrop dialogs by clicking outside`, async ({
    page,
  }) => {
    await getButton(page, "Open dialog").click();
    await getButton(page, `${name} no backdrop`).click();
    await getButton(page, `${name} no backdrop ${name}`).click();
    await expect(getDialog(page, "Dialog")).toBeVisible();
    await expect(getDialog(page, `${name} no backdrop`)).toBeVisible();
    await expect(getDialog(page, `${name} no backdrop ${name}`)).toBeVisible();
    await page.mouse.click(1, 1);
    await expect(getDialog(page, "Dialog")).not.toBeVisible();
    await expect(getDialog(page, `${name} no backdrop`)).not.toBeVisible();
    await expect(
      getDialog(page, `${name} no backdrop ${name}`)
    ).not.toBeVisible();
    await expect(getButton(page, "Open dialog")).toBeFocused();
  });
}

for (const name of ["nested", "sibling"]) {
  test(`hide only the topmost ${name} no backdrop dialog by on the parent dialog`, async ({
    page,
  }) => {
    await getButton(page, "Open dialog").click();
    await getButton(page, `${name} no backdrop`).click();
    await getButton(page, `${name} no backdrop ${name}`).click();
    await expect(getDialog(page, "Dialog")).toBeVisible();
    await expect(getDialog(page, `${name} no backdrop`)).toBeVisible();
    await expect(getDialog(page, `${name} no backdrop ${name}`)).toBeVisible();
    await page.mouse.click(500, 220);
    await expect(getDialog(page, "Dialog")).toBeVisible();
    await expect(getDialog(page, `${name} no backdrop`)).toBeVisible();
    await expect(
      getDialog(page, `${name} no backdrop ${name}`)
    ).not.toBeVisible();
    await page.mouse.click(500, 280);
    await expect(getDialog(page, "Dialog")).toBeVisible();
    await expect(getDialog(page, `${name} no backdrop`)).not.toBeVisible();
  });
}

for (const { name, type } of [
  { name: "nested", type: " dismiss animated" },
  { name: "sibling", type: " dismiss animated" },
  { name: "sibling", type: " dismiss animated unmount" },
]) {
  test(`${name}${type}`, async ({ page }) => {
    await getButton(page, "Open dialog").click();
    await expect(getDialog(page, "Dialog")).toBeVisible();
    await getButton(page, `${name}${type}`).click();
    await expect(getDialog(page, `${name}${type}`)).toBeVisible();
    await expect(getDialog(page, "Dialog")).not.toBeVisible();
    await expect(canScrollBody(page)).resolves.toBe(false);
    await getButton(page, `${name}${type} ${name}`).click();
    await expect(getDialog(page, `${name}${type} ${name}`)).toBeVisible();
    await expect(getDialog(page, `${name}${type}`)).not.toBeVisible();
    await expect(canScrollBody(page)).resolves.toBe(false);
    await page.keyboard.press("Escape");
    await expect(getButton(page, "Open dialog")).toBeFocused();
    await expect(getDialog(page, `${name}${type} ${name}`)).not.toBeVisible();
    await expect(canScrollBody(page)).resolves.toBe(true);
  });
}
