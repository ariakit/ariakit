import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/7114
  test("extends forward across mounted sibling branches", async ({ q }) => {
    await test.expect(q.listbox("Mounted sibling branches")).toBeVisible();
    await q.option("Coral").click();
    await q.option("Indigo").click({ modifiers: ["Shift"] });

    await test
      .expect(q.status("Mounted selection"))
      .toHaveText("2 selected: Coral, Indigo");
  });

  // https://github.com/ariakit/ariakit/issues/7114
  test("extends in reverse across mounted sibling branches", async ({ q }) => {
    await test.expect(q.listbox("Mounted sibling branches")).toBeVisible();
    await q.option("Indigo").click();
    await q.option("Coral").click({ modifiers: ["Shift"] });

    await test
      .expect(q.status("Mounted selection"))
      .toHaveText("2 selected: Coral, Indigo");
  });

  // https://github.com/ariakit/ariakit/issues/7114
  test("restores mounted sibling order after zero root items", async ({
    q,
  }) => {
    await test.expect(q.listbox("Mounted sibling branches")).toBeVisible();
    await test.expect(q.option("Amber")).toBeVisible();

    await q.button("Hide sibling branches").click();
    await test
      .expect(q.status("Mounted branch source"))
      .toHaveText("Root source: 0");
    await test.expect(q.option("Amber")).toHaveCount(0);

    await q.button("Restore sibling branches").click();
    await test.expect(q.option("Amber")).toBeVisible();
    await test
      .expect(q.status("Mounted branch source"))
      .toHaveText("Root source: array");

    await q.button("Select all mounted").click();
    await test
      .expect(q.status("Mounted selection"))
      .toHaveText("4 selected: Amber, Coral, Indigo, Violet");
  });
});
