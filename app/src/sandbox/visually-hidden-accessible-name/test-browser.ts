import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("contributes to the button name while remaining visually hidden", async ({
    q,
  }) => {
    await test.expect(q.button("Undo")).toBeVisible();

    const text = q.text("Undo");
    await test.expect(text).toHaveCSS("border-width", "0px");
    await test.expect(text).toHaveCSS("clip-path", "inset(50%)");
    await test.expect(text).toHaveCSS("height", "1px");
    await test.expect(text).toHaveCSS("margin", "-1px");
    await test.expect(text).toHaveCSS("overflow", "hidden");
    await test.expect(text).toHaveCSS("padding", "0px");
    await test.expect(text).toHaveCSS("position", "absolute");
    await test.expect(text).toHaveCSS("white-space", "nowrap");
    await test.expect(text).toHaveCSS("width", "1px");
  });
});
