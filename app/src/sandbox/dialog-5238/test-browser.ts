import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // Reproduces https://github.com/ariakit/ariakit/issues/5238
  test("keeps the frontmost initially open sibling dialog interactive", async ({
    page,
    q,
  }) => {
    await test.expect(q.dialog("Apples")).toBeVisible();
    await q.button("Eat apple").click();
    await test.expect(q.status("Apple count")).toHaveText("Apples eaten: 1");

    const applesId = await q.dialog("Apples").getAttribute("id");
    await page
      .locator(`[data-backdrop="${applesId}"]`)
      .click({ button: "right", position: { x: 4, y: 4 } });
    await test.expect(q.dialog("Apples")).not.toBeVisible();
    await test.expect(page.locator("[data-dialog]")).toHaveCount(1);
    await test.expect(q.dialog("Oranges")).toBeVisible();
    await q.button("Eat orange").click();
    await test.expect(q.status("Orange count")).toHaveText("Oranges eaten: 1");
  });

  // Reproduces the backdrop replacement case found while fixing #5238.
  test("keeps the background open after replacing the foreground backdrop", async ({
    page,
    q,
  }) => {
    const applesId = await q.dialog("Apples").getAttribute("id");
    const previousBackdrop = page.locator(`[data-backdrop="${applesId}"]`);
    await previousBackdrop.evaluate((element) => {
      element.setAttribute("data-previous-backdrop", "");
    });

    await q.button("Replace apple backdrop").click();
    await test.expect(page.locator("[data-previous-backdrop]")).toHaveCount(0);

    await page
      .locator("[data-replacement-backdrop]")
      .click({ button: "right", position: { x: 4, y: 4 } });

    await test.expect(q.dialog("Apples")).not.toBeVisible();
    await test.expect(page.locator("[data-dialog]")).toHaveCount(1);
    await test.expect(q.dialog("Oranges")).toBeVisible();
  });

  // Reproduces the dialog host replacement case found while fixing #5238.
  test("preserves the stack order when replacing the background dialog", async ({
    page,
    q,
  }) => {
    await q.button("Replace orange dialog").click();

    await test.expect(page.locator("[data-replacement-dialog]")).toBeVisible();
    await test.expect(q.dialog("Apples")).toBeVisible();
    await q.button("Eat apple").click();
    await test.expect(q.status("Apple count")).toHaveText("Apples eaten: 1");
  });
});
