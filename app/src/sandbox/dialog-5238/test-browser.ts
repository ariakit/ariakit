import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // Reproduces https://github.com/ariakit/ariakit/issues/5238
  test("keeps the frontmost initially open sibling dialog interactive", async ({
    page,
    q,
  }) => {
    const dialogs = q.dialog(undefined, { includeHidden: true });
    const orangesDialog = q.dialog("Oranges", { includeHidden: true });
    const applesDialog = q.dialog("Apples", { includeHidden: true });

    await test.expect(dialogs).toHaveCount(2);
    await test.expect(orangesDialog).toBeVisible();
    await test.expect(applesDialog).toBeVisible();
    await test
      .expect(
        orangesDialog.evaluate(
          (element) => element.closest("[inert]") !== null,
        ),
      )
      .resolves.toBe(true);
    await test
      .expect(
        applesDialog.evaluate((element) => element.closest("[inert]") !== null),
      )
      .resolves.toBe(false);

    await q.button("Eat apple").click();
    await test.expect(q.status("Apple count")).toHaveText("Apples eaten: 1");
    await test
      .expect(
        orangesDialog.evaluate(
          (element) => element.closest("[inert]") !== null,
        ),
      )
      .resolves.toBe(true);
    await test
      .expect(
        applesDialog.evaluate((element) => element.closest("[inert]") !== null),
      )
      .resolves.toBe(false);

    await page.getByTestId("apples-backdrop").click({
      button: "right",
      position: { x: 1, y: 1 },
    });
    await test.expect(q.dialog("Apples")).not.toBeVisible();
    await test.expect(q.dialog("Oranges")).toBeVisible();
    await test
      .expect(
        orangesDialog.evaluate(
          (element) => element.closest("[inert]") !== null,
        ),
      )
      .resolves.toBe(false);
    await q.button("Eat orange").press("Enter");
    await test.expect(q.status("Orange count")).toHaveText("Oranges eaten: 1");
  });
});
