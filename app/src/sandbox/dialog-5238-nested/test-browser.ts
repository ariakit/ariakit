import type { Locator } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

function isInert(locator: Locator) {
  return locator.evaluate((element) => element.closest("[inert]") !== null);
}

withFramework(import.meta.dirname, async ({ test }) => {
  // Reproduces https://github.com/ariakit/ariakit/issues/5238
  test("keeps an initially open inline nested dialog in front", async ({
    page,
    q,
  }) => {
    await test.expect(page.locator("[data-dialog]")).toHaveCount(2);
    await test.expect(q.dialog("Parent")).not.toBeVisible();
    await test.expect(q.dialog("Child")).toBeVisible();
    await q.button("Interact with child").click();
    await test
      .expect(q.status("Child count"))
      .toHaveText("Child interactions: 1");

    await q.button("Move child to portal").click();
    await test.expect.poll(() => isInert(q.dialog("Parent"))).toBe(true);
    await test.expect(q.dialog("Child")).toBeVisible();
    await q.button("Interact with child").click();
    await test
      .expect(q.status("Child count"))
      .toHaveText("Child interactions: 2");

    await q.button("Close child").click();
    await test.expect(q.dialog("Child")).not.toBeVisible();
    await test.expect(q.dialog("Parent")).toBeVisible();
    await q.button("Interact with parent").click();
    await test
      .expect(q.status("Parent count"))
      .toHaveText("Parent interactions: 1");

    await q.button("Remount with portaled child").click();
    await test.expect.poll(() => isInert(q.dialog("Parent"))).toBe(true);
    await test.expect(q.dialog("Child")).toBeVisible();
    await q.button("Interact with child").click();
    await test
      .expect(q.status("Child count"))
      .toHaveText("Child interactions: 3");
  });

  test("keeps a portaled child in front when its parent reopens", async ({
    q,
  }) => {
    await q.button("Move child to portal").click();
    await q.button("Hide parent").click();
    await test.expect(q.dialog("Parent")).not.toBeVisible();
    await test.expect(q.dialog("Child")).toBeVisible();

    await q.button("Show parent").click();
    await test.expect.poll(() => isInert(q.dialog("Parent"))).toBe(true);
    await test.expect(q.dialog("Child")).toBeVisible();
    await q.button("Interact with child").click();
    await test
      .expect(q.status("Child count"))
      .toHaveText("Child interactions: 1");
  });

  test("keeps a later sibling in front of a portaled nested branch", async ({
    q,
  }) => {
    await q.button("Remount portaled branch with sibling").click();

    await test.expect.poll(() => isInert(q.dialog("Parent"))).toBe(true);
    await test.expect.poll(() => isInert(q.dialog("Child"))).toBe(true);
    await test.expect(q.dialog("Sibling")).toBeVisible();
    await test.expect.poll(() => isInert(q.dialog("Sibling"))).toBe(false);
    await q.button("Interact with sibling").click();
    await test
      .expect(q.status("Sibling count"))
      .toHaveText("Sibling interactions: 1");
  });
});
