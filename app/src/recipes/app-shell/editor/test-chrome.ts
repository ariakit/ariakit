import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  test("names the editor screen and the fill field", async ({ q }) => {
    // The document title starts the heading outline above the mock page.
    await test
      .expect(q.heading("Spring Sale Landing Page"))
      .toHaveJSProperty("tagName", "H1");
    const properties = query(q.complementary("Properties"));
    await test.expect(properties.textbox("Fill")).toHaveValue("#111827");
  });

  // The rail width adds up the frame paddings around a button. Each one rounds
  // to a whole pixel on its own, so the sum must round the same way.
  // https://github.com/ariakit/ariakit/issues/8179
  test("keeps the tool rail buttons square", async ({ q }) => {
    const button = query(q.complementary("Tools")).radio("Move");
    await test.expect(button).toBeVisible();
    const box = await button.boundingBox();
    test.expect(box?.width).toBe(box?.height);
  });

  // Chrome resolves a half-pixel round() differently under zoom in a plain
  // custom property than in a registered one, which frame padding uses.
  // https://github.com/ariakit/ariakit/issues/8179
  test("keeps the tool rail buttons square at 90% zoom", async ({
    page,
    q,
  }) => {
    await page.addStyleTag({ content: "html { zoom: 0.9; }" });
    const rail = query(q.complementary("Tools"));
    const button = rail.radio("Move");
    await test.expect(button).toBeVisible();
    // The sidebar width follows the zoom through a transition.
    await test.expect
      .poll(async () => {
        const box = await button.boundingBox();
        return Math.abs((box?.width ?? 0) - (box?.height ?? 0));
      })
      .toBeLessThan(1);
  });
});
