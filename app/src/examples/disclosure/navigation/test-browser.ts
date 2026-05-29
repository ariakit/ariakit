import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("hover @visual", async ({ q, visual }) => {
    await q.button("Guides").hover();
    await visual();
  });

  test("open @visual", async ({ q, visual }) => {
    await q.button("Guides").click();
    await q.link("Styling & Theming").hover();
    await visual();
  });

  test("click link @visual", async ({ page, q, visual }) => {
    await q.button("Guides").click();
    await q.link("Accessibility").click();
    await test.expect(page).toHaveURL(/\/#\/guides\/accessibility$/);
    await visual();
  });
});
