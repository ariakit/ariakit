import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { test } from "#app/test-utils/fixtures.ts";
import { withFramework } from "#app/test-utils/preview.ts";

// This 29-test matrix uses the same options and navigates back to the preview
// before every test. Reuse one context per worker so WebKit doesn't keep
// opening contexts against the same long-lived browser process.
test.use({ reuseContext: true });

withFramework(import.meta.dirname, async ({ test }) => {
  function query(locator: Page | Locator) {
    return {
      button: (name: string) =>
        locator.getByRole("button", { name, exact: true }),
      dialog: (name: string) =>
        locator
          .getByRole("dialog", { name, exact: true, includeHidden: true })
          .or(
            locator.getByRole("heading", { name, exact: true }).locator(".."),
          ),
      accDialog: (name: string) =>
        locator.getByRole("dialog", { name, exact: true }),
    };
  }

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

  async function clickInsideButOutside(
    page: Page,
    inside: Locator,
    outside: Locator,
  ) {
    const insideBox = await inside.boundingBox();
    const outsideBox = await outside.boundingBox();
    expect(insideBox).not.toBeNull();
    expect(outsideBox).not.toBeNull();
    if (!insideBox || !outsideBox) return;
    const candidates = [
      { x: insideBox.x + 1, y: insideBox.y + 1 },
      { x: insideBox.x + insideBox.width - 1, y: insideBox.y + 1 },
      { x: insideBox.x + 1, y: insideBox.y + insideBox.height - 1 },
      {
        x: insideBox.x + insideBox.width - 1,
        y: insideBox.y + insideBox.height - 1,
      },
    ];
    const point = candidates.find(({ x, y }) => {
      const outsideX =
        x >= outsideBox.x && x <= outsideBox.x + outsideBox.width;
      const outsideY =
        y >= outsideBox.y && y <= outsideBox.y + outsideBox.height;
      return !outsideX || !outsideY;
    });
    expect(point).toBeDefined();
    if (!point) return;
    await page.mouse.click(point.x, point.y);
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
      await expect(q.button("Open dialog")).not.toBeFocused();
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
      await expect(q.button("Open dialog")).not.toBeFocused();
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
      await clickInsideButOutside(
        page,
        q.dialog(`${name} no backdrop`),
        q.dialog(`${name} no backdrop ${name}`),
      );
      await expect(q.dialog("Dialog")).toBeVisible();
      await expect(q.dialog(`${name} no backdrop`)).toBeVisible();
      await expect(q.dialog(`${name} no backdrop ${name}`)).not.toBeVisible();
      await clickInsideButOutside(
        page,
        q.dialog("Dialog"),
        q.dialog(`${name} no backdrop`),
      );
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
});
