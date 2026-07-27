import { expect } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

export function testDialogHideWarning(dirname: string) {
  withFramework(dirname, async ({ test }) => {
    test("closes without warning when the form is empty", async ({ q }) => {
      await q.button("Post").click();
      await expect(q.dialog("Post")).toBeVisible();
      await expect(q.textbox()).toBeFocused();
      await q.button("Dismiss popup").click();
      await expect(q.dialog("Post")).not.toBeAttached();
    });

    test("warns on Escape and can save", async ({ page, q }) => {
      await q.button("Post").click();
      await q.textbox().fill("Hello");
      await page.keyboard.press("Escape");
      await expect(q.dialog("Save post?")).toBeVisible();
      await expect(q.button("Save")).toBeFocused();
      await page.keyboard.press("Escape");
      await expect(q.dialog("Save post?")).not.toBeAttached();
      await expect(q.dialog("Post")).toBeVisible();
      await expect(q.textbox()).toBeFocused();
      await page.keyboard.press("Escape");
      await expect(q.dialog("Save post?")).toBeVisible();
      await page.keyboard.press("Enter");
      await expect(q.dialog("Post")).not.toBeAttached();
      await expect(q.dialog("Save post?")).not.toBeAttached();
      await expect(q.button("Post")).toBeFocused();
    });

    test("warns on outside click and can save", async ({ page, q }) => {
      await q.button("Post").click();
      await q.textbox().fill("Hello");
      await page
        .locator(".backdrop:visible")
        .last()
        .click({ position: { x: 2, y: 2 } });
      await expect(q.dialog("Save post?")).toBeVisible();
      await expect(q.button("Save")).toBeFocused();
      await page
        .locator(".backdrop:visible")
        .last()
        .click({ position: { x: 2, y: 2 } });
      await expect(q.dialog("Save post?")).not.toBeAttached();
      await expect(q.dialog("Post")).toBeVisible();
      await expect(q.textbox()).toBeFocused();
      await page
        .locator(".backdrop:visible")
        .last()
        .click({ position: { x: 2, y: 2 } });
      await expect(q.dialog("Save post?")).toBeVisible();
      await q.button("Save").click();
      await expect(q.dialog("Post")).not.toBeAttached();
      await expect(q.dialog("Save post?")).not.toBeAttached();
      await expect(q.button("Post")).toBeFocused();
    });

    test("warns on dismiss and can discard", async ({ page, q }) => {
      await q.button("Post").click();
      await q.textbox().fill("Hello");
      await q.button("Dismiss popup").click();
      await expect(q.dialog("Save post?")).toBeVisible();
      await expect(q.button("Save")).toBeFocused();
      await page
        .locator(".backdrop:visible")
        .last()
        .click({ position: { x: 2, y: 2 } });
      await expect(q.textbox()).toBeFocused();
      await q.dialog("Post").getByRole("button", { name: "Post" }).click();
      await expect(q.dialog("Post")).not.toBeAttached();
      await expect(q.button("Post")).toBeFocused();
    });
  });
}
