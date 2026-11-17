import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  test("opens the full-height customize panel and applies a theme", async ({
    q,
  }) => {
    const customize = q.button("Customize");
    await test.expect(q.complementary("Customize")).not.toBeVisible();
    await customize.click();
    await test.expect(customize).toHaveAttribute("aria-expanded", "true");
    const panel = q.complementary("Customize");
    await test.expect(panel).toBeVisible();
    // The panel belongs to the outer shell, so it spans the page header too.
    const panelBox = await panel.boundingBox();
    const headerBox = await q.banner().boundingBox();
    test.expect(panelBox?.y).toBeLessThanOrEqual(headerBox?.y ?? 0);
    const density = query(q.radiogroup("Density"));
    await density.radio("Compact").click();
    await test
      .expect(density.radio("Compact"))
      .toHaveAttribute("aria-checked", "true");
    // The draft applies only after Apply.
    await test.expect(q.main()).toHaveCSS("font-size", "16px");
    await query(panel).button("Apply").click();
    await test.expect(customize).toHaveAttribute("aria-expanded", "false");
    await test.expect(panel).not.toBeVisible();
    await test.expect(q.main()).toHaveCSS("font-size", "14px");
  });

  test("closing the customize panel discards the draft", async ({ q }) => {
    const customize = q.button("Customize");
    await customize.click();
    const density = query(q.radiogroup("Density"));
    await density.radio("Compact").click();
    await customize.click();
    await test.expect(q.complementary("Customize")).not.toBeVisible();
    await customize.click();
    await test
      .expect(query(q.radiogroup("Density")).radio("Comfortable"))
      .toHaveAttribute("aria-checked", "true");
    await test.expect(q.main()).toHaveCSS("font-size", "16px");
  });
});
