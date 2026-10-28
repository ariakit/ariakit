import type { Page } from "@ariakit/test/playwright";
import { expect } from "@ariakit/test/playwright";
import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

function pressTab(page: Page, browserName: string, shift = false) {
  const key = shift ? "Shift+Tab" : "Tab";
  if (browserName === "webkit") {
    return page.keyboard.press(`Alt+${key}`);
  }
  return page.keyboard.press(key);
}

// Waits on a page timer instead of a test runner timer. A page timer scheduled
// earlier with the same delay always runs first, so this can't resolve before a
// pending hideTimeout does.
function waitForPageTimeout(page: Page, timeout: number) {
  return page.evaluate(
    (timeout) => new Promise((resolve) => setTimeout(resolve, timeout)),
    timeout,
  );
}

withFramework(import.meta.dirname, async ({ test }) => {
  test.describe.configure({ retries: 2 });

  // https://github.com/ariakit/ariakit/issues/8086
  test("keep the next menu open after crossing the gap between items", async ({
    page,
    q,
  }) => {
    await q.menuitem("Services").hover();
    await expect(q.menu("Services")).toBeVisible();
    const services = await q.menuitem("Services").boundingBox();
    const blog = await q.menuitem("Blog").boundingBox();
    if (!services) throw new Error("Services has no bounding box");
    if (!blog) throw new Error("Blog has no bounding box");
    // Stopping in the gap between the items schedules the hide while Services
    // still owns the shared menu, before Blog takes it over.
    const gapX = (services.x + services.width + blog.x) / 2;
    await page.mouse.move(gapX, blog.y + blog.height / 2);
    await q.menuitem("Blog").hover();
    await expect(q.menu("Blog")).toBeVisible();
    // No observable state tracks the hide that stopping in the gap schedules,
    // so cross the fixture's 250ms hideTimeout before asserting that the Blog
    // menu stays open while the pointer rests on Blog.
    await waitForPageTimeout(page, 250);
    await expect(q.menu("Blog")).toBeVisible();
  });

  test("show menus by tabbing through items", async ({
    page,
    q,
    browserName,
  }) => {
    await pressTab(page, browserName);
    await expect(q.menuitem("Services")).toBeFocused();
    await pressTab(page, browserName);
    await expect(q.menuitem("Web Development")).toBeFocused();
    await pressTab(page, browserName);
    await expect(q.menuitem("Mobile Development")).toBeFocused();
    await pressTab(page, browserName);
    await expect(q.menuitem("Blog")).toBeFocused();
    await expect(q.menu("Blog")).toBeVisible();
    await pressTab(page, browserName);
    await expect(q.menuitem("Tech")).toBeFocused();
    await pressTab(page, browserName);
    await expect(q.menuitem("Business")).toBeFocused();
    await pressTab(page, browserName);
    await expect(q.menuitem("Archives")).toBeFocused();
    await pressTab(page, browserName);
    await expect(q.menuitem("Company")).toBeFocused();
    await expect(q.menu("Blog")).not.toBeVisible();
    await expect(q.menu("Company")).toBeVisible();
    await pressTab(page, browserName);
    await expect(q.menuitem("About Us")).toBeFocused();
    await pressTab(page, browserName);
    await expect(q.menuitem("HR")).toBeFocused();
    await pressTab(page, browserName);
    await expect(q.menuitem("Finance")).toBeFocused();
    await pressTab(page, browserName);
    await expect(q.menuitem("Contact")).toBeFocused();
    await expect(q.menu("Company")).not.toBeVisible();
    await pressTab(page, browserName, true);
    await expect(q.menuitem("Company")).toBeFocused();
    await expect(q.menu("Company")).toBeVisible();
    await pressTab(page, browserName, true);
    await expect(q.menuitem("Blog")).toBeFocused();
    await expect(q.menu("Company")).not.toBeVisible();
    await expect(q.menu("Blog")).toBeVisible();
    await pressTab(page, browserName);
    await expect(q.menuitem("Tech")).toBeFocused();
    await pressTab(page, browserName, true);
    await expect(q.menuitem("Blog")).toBeFocused();
    await expect(q.menu("Blog")).toBeVisible();
    await pressTab(page, browserName, true);
    await expect(q.menuitem("Services")).toBeFocused();
    await expect(q.menu("Blog")).not.toBeVisible();
    await expect(q.menu("Services")).toBeVisible();
  });

  test("click on menuitem links", async ({ page, q, browserName }) => {
    await q.menuitem("Services").hover();
    await expect(q.menu("Services")).toBeVisible();
    await q.menuitem("Services").click();
    await page.waitForURL(/#\/services$/);
    await expect(q.menu("Services")).toBeVisible();

    await q.menuitem("Contact").click();
    await q.menuitem("Contact").focus();
    await page.waitForURL(/#\/contact$/);
    await expect(q.menu("Services")).not.toBeVisible();

    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("Enter");

    await page.waitForURL(/#\/services$/);
    await expect(q.menu("Services")).toBeVisible();

    if (browserName !== "firefox") {
      await expect(q.menuitem("Web Development")).toBeFocused();
    }

    await page.keyboard.press("Escape");
    await expect(q.menuitem("Services")).toBeFocused();
    // Services becomes focus-visible on the next frame, and its onFocusVisible
    // shows the menu again.
    await expect(q.menuitem("Services")).toHaveAttribute(
      "data-focus-visible",
      "true",
    );
    // The menu hides again two frames after Escape, and no state tracks that
    // pending hide. An Enter before that frame lands on the reopened menu.
    await flushFrames(page, 1);
    await expect(q.menu("Services")).not.toBeVisible();
    await page.keyboard.press("Enter");
    await expect(q.menu("Services")).not.toBeVisible();
    await expect(q.menuitem("Services")).toBeFocused();
  });
});
