import { withFramework } from "#app/test-utils/preview.ts";

// Reproduces https://github.com/ariakit/ariakit/issues/6296
withFramework(import.meta.dirname, async ({ test }) => {
  test("honors prevented mousedown on disclosure", async ({ q }) => {
    await q.textbox("Notes").click();
    await test.expect(q.textbox("Notes")).toBeFocused();

    await q.button("Show popup").click();

    await test.expect(q.listbox()).toBeVisible();
    await test.expect(q.textbox("Notes")).toBeFocused();
    await test.expect(q.combobox("Fruit")).not.toBeFocused();
  });
});
