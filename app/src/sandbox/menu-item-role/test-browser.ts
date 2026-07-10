import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("updates item roles with the rendered menu", async ({ q }) => {
    await test.expect(q.menuitem("Layout item")).toBeVisible();
    await test.expect(q.treeitem("Layout item")).toHaveCount(0);
    await test.expect(q.option("Mismatched item")).toBeVisible();
    await test.expect(q.menuitem("Reapply item")).toBeVisible();

    await q.button("Actions").click();
    await test.expect(q.menuitem("Edit")).toBeVisible();

    await q.button("Use listbox role").click();

    await test.expect(q.option("Edit")).toBeVisible();
    await test.expect(q.menuitem("Edit")).toHaveCount(0);

    await q.button("Use tree role").click();

    await test.expect(q.treeitem("Edit")).toBeVisible();
    await test.expect(q.option("Edit")).toHaveCount(0);

    await q.button("Remove role").click();

    await test.expect(q.menuitem("Edit")).toBeVisible();
    await test.expect(q.treeitem("Edit")).toHaveCount(0);

    await q.button("Hook menu").click();

    await test.expect(q.option("Hook item")).toBeVisible();
  });
});
