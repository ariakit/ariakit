import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("open @visual", async ({ q, visual }) => {
    await q.button("Handling User Interactions and Side Effects").click();
    await test
      .expect(q.text("To improve usability, the dropdown"))
      .toBeVisible();
    await q.button("Ensuring Accessibility and Semantics").click();
    await q.text("its visual representation.").click();
    await visual();
  });
});
