import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // examples/select-items-unmount/test.ts
  test("restores registered items after the popover unmounts", async ({
    q,
  }) => {
    const select = q.combobox("Favorite fruit");
    await select.click();
    await q.option("Banana").click();
    await test.expect(q.listbox()).toHaveCount(0);

    await select.click();
    await test
      .expect(q.option("Banana"))
      .toHaveAttribute("aria-selected", "true");
    await test.expect(q.option("Banana")).toHaveAttribute("data-active-item");
  });
});
