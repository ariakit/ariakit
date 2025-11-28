import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("hover @visual", async ({ q, visual }) => {
    await q.button("Set up payments").hover();
    await visual();
  });

  test("open @visual", async ({ q, visual }) => {
    await q.button("Set up invoices").click();
    await q.link("Add your branding").hover();
    await visual();
  });
});
