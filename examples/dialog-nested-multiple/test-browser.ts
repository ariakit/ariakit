import type { Locator, Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

function query(locator: Page | Locator) {
  return {
    button: (name: string) =>
      locator.getByRole("button", { name, exact: true }),
    dialog: (name: string) =>
      locator
        .getByRole("dialog", { name, exact: true, includeHidden: true })
        .or(locator.getByRole("none", { name, exact: true })),
    accDialog: (name: string) =>
      locator.getByRole("dialog", { name, exact: true }),
  };
}

// const getButton = (page: Page | Locator, name: string) =>
//   page.getByRole("button", { name, exact: true });

// const getAccessibleDialog = (page: Page | Locator, name: string) =>
//   page.getByRole("dialog", { name, exact: true });

// const getDialog = (page: Page | Locator, name: string) =>
//   page.getByRole("dialog", { includeHidden: true, name, exact: true });

async function expectAccessibleDialog(
  page: Page | Locator,
  name: string,
  toBeVisible: boolean,
) {
  const q = query(page);
  const dialog = q.accDialog(name);
  if (toBeVisible) {
    return expect(dialog).toBeVisible();
  }
  try {
    await expect(dialog).not.toBeVisible({ timeout: 500 });
  } catch {
    const inert = await dialog.evaluate(
      (dialog) => !!dialog.closest("[inert]"),
      { timeout: 500 },
    );
    expect(inert).toBeTruthy();
  }
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
  { name: "nested", type: " parent backdrop" },
  { name: "sibling", type: " parent backdrop" },
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
    const q = query(page);
    await q.button("Open dialog").click();
    await q.button(`${name}${type}`).click();
    await q.button(`${name}${type} ${name}`).click();
    await expect(q.dialog("Dialog")).toBeVisible();
    await expect(q.dialog(`${name}${type}`)).toBeVisible();
    await expect(q.dialog(`${name}${type} ${name}`)).toBeVisible();
    await expectAccessibleDialog(page, "Dialog", false);
    await expectAccessibleDialog(page, `${name}${type}`, false);
    await expectAccessibleDialog(page, `${name}${type} ${name}`, true);
    await expect(canScrollBody(page)).resolves.toBe(false);
    await page.keyboard.press("Escape");
    await expect(q.dialog(`${name}${type} ${name}`)).not.toBeVisible();
    await expect(q.dialog(`${name}${type}`)).toBeVisible();
    await expectAccessibleDialog(page, "Dialog", false);
    await expectAccessibleDialog(page, `${name}${type}`, true);
    await expect(canScrollBody(page)).resolves.toBe(false);
    await page.keyboard.press("Escape");
    await expect(q.dialog(`${name}${type}`)).not.toBeVisible();
    await expect(q.dialog("Dialog")).toBeVisible();
    await expectAccessibleDialog(page, "Dialog", true);
    await expect(canScrollBody(page)).resolves.toBe(false);
    await page.keyboard.press("Escape");
    await expect(q.button("Open dialog")).toBeFocused();
    await expect(q.dialog("Dialog")).not.toBeVisible();
    await expect(canScrollBody(page)).resolves.toBe(true);
  });
}

for (const { name, type } of [
  { name: "nested", type: "" },
  { name: "sibling", type: "" },
  { name: "nested", type: " parent backdrop" },
  { name: "sibling", type: " parent backdrop" },
  { name: "nested", type: " unmount" },
  { name: "sibling", type: " unmount" },
  { name: "nested", type: " no portal" },
  { name: "sibling", type: " no portal" },
  { name: "nested", type: " no portal portal" },
  { name: "sibling", type: " no portal portal" },
]) {
  test(`hide ${name}${type} dialog by clicking outside`, async ({ page }) => {
    const q = query(page);
    await q.button("Open dialog").click();
    await q.button(`${name}${type}`).click();
    await q.button(`${name}${type} ${name}`).click();
    await expect(q.dialog("Dialog")).toBeVisible();
    await expect(q.dialog(`${name}${type}`)).toBeVisible();
    await expect(q.dialog(`${name}${type} ${name}`)).toBeVisible();
    await expectAccessibleDialog(page, "Dialog", false);
    await expectAccessibleDialog(page, `${name}${type}`, false);
    await expectAccessibleDialog(page, `${name}${type} ${name}`, true);
    await expect(canScrollBody(page)).resolves.toBe(false);
    await page.mouse.click(1, 1);
    await expect(q.dialog(`${name}${type} ${name}`)).not.toBeVisible();
    await expect(q.dialog(`${name}${type}`)).toBeVisible();
    await expectAccessibleDialog(page, "Dialog", false);
    await expectAccessibleDialog(page, `${name}${type}`, true);
    await expect(canScrollBody(page)).resolves.toBe(false);
    await page.mouse.click(1, 1);
    await expect(q.dialog(`${name}${type}`)).not.toBeVisible();
    await expect(q.dialog("Dialog")).toBeVisible();
    await expectAccessibleDialog(page, "Dialog", true);
    await expect(canScrollBody(page)).resolves.toBe(false);
    await page.mouse.click(1, 1);
    await expect(q.button("Open dialog")).toBeFocused();
    await expect(q.dialog("Dialog")).not.toBeVisible();
    await expect(canScrollBody(page)).resolves.toBe(true);
  });
}

for (const name of ["nested", "sibling"]) {
  test(`hide all ${name} no backdrop dialogs by clicking outside`, async ({
    page,
  }) => {
    const q = query(page);
    await q.button("Open dialog").click();
    await q.button(`${name} no backdrop`).click();
    await q.button(`${name} no backdrop ${name}`).click();
    await expect(q.dialog("Dialog")).toBeVisible();
    await expect(q.dialog(`${name} no backdrop`)).toBeVisible();
    await expect(q.dialog(`${name} no backdrop ${name}`)).toBeVisible();
    await page.mouse.click(1, 1);
    await expect(q.dialog("Dialog")).not.toBeVisible();
    await expect(q.dialog(`${name} no backdrop`)).not.toBeVisible();
    await expect(q.dialog(`${name} no backdrop ${name}`)).not.toBeVisible();
    await expect(q.button("Open dialog")).toBeFocused();
  });
}

for (const name of ["nested", "sibling"]) {
  test(`hide only the topmost ${name} no backdrop dialog by on the parent dialog`, async ({
    page,
  }) => {
    const q = query(page);
    await q.button("Open dialog").click();
    await q.button(`${name} no backdrop`).click();
    await q.button(`${name} no backdrop ${name}`).click();
    await expect(q.dialog("Dialog")).toBeVisible();
    await expect(q.dialog(`${name} no backdrop`)).toBeVisible();
    await expect(q.dialog(`${name} no backdrop ${name}`)).toBeVisible();
    await page.mouse.click(500, 220);
    await expect(q.dialog("Dialog")).toBeVisible();
    await expect(q.dialog(`${name} no backdrop`)).toBeVisible();
    await expect(q.dialog(`${name} no backdrop ${name}`)).not.toBeVisible();
    await page.mouse.click(500, 280);
    await expect(q.dialog("Dialog")).toBeVisible();
    await expect(q.dialog(`${name} no backdrop`)).not.toBeVisible();
  });
}

for (const { name, type } of [
  { name: "nested", type: " dismiss animated" },
  { name: "sibling", type: " dismiss animated" },
  { name: "sibling", type: " dismiss animated unmount" },
]) {
  test(`${name}${type}`, async ({ page }) => {
    const q = query(page);
    await q.button("Open dialog").click();
    await expect(q.dialog("Dialog")).toBeVisible();
    await q.button(`${name}${type}`).click();
    await expect(q.dialog(`${name}${type}`)).toBeVisible();
    await expect(q.dialog("Dialog")).not.toBeVisible();
    await expect(canScrollBody(page)).resolves.toBe(false);
    await q.button(`${name}${type} ${name}`).click();
    await expect(q.dialog(`${name}${type} ${name}`)).toBeVisible();
    await expect(q.dialog(`${name}${type}`)).not.toBeVisible();
    await expect(canScrollBody(page)).resolves.toBe(false);
    await page.keyboard.press("Escape");
    await expect(q.button("Open dialog")).toBeFocused();
    await expect(q.dialog(`${name}${type} ${name}`)).not.toBeVisible();
    await expect(canScrollBody(page)).resolves.toBe(true);
  });
}
