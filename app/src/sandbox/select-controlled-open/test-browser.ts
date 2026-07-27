import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // examples/select-default-open-controlled/test.ts
  test("toggles a controlled popover from its initial open state", async ({
    q,
  }) => {
    const select = q.combobox("Favorite fruit");
    await test.expect(q.listbox()).toBeVisible();

    await select.click();
    await test.expect(q.listbox()).toHaveCount(0);

    await select.click();
    await test.expect(q.listbox()).toBeVisible();
  });
});
