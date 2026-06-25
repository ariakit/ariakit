import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("closed grid select with controlled items navigates between cells", async ({
    page,
    q,
  }) => {
    // Controlled public items omit rowId; the rendered registration provides it.
    await test.expect(q.status("Grid state rowId")).toHaveText("missing");
    await test.expect(q.status("Grid lookup rowId")).not.toHaveText("missing");

    await q.combobox("Grid fruit").focus();
    await test.expect(q.status("Grid value")).toHaveText("None");

    // The default select orientation is vertical, so horizontal movement on the
    // closed select only works when it recognizes the grid.
    await page.keyboard.press("ArrowRight");
    await test.expect(q.status("Grid value")).toHaveText("Top Left");

    await page.keyboard.press("ArrowRight");
    await test.expect(q.status("Grid value")).toHaveText("Top Center");

    // ArrowLeft is gated on the same grid detection, so it must move back.
    await page.keyboard.press("ArrowLeft");
    await test.expect(q.status("Grid value")).toHaveText("Top Left");
  });
});
