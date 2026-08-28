import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  // https://github.com/ariakit/ariakit/issues/7302
  test("nested tree list owns the popup role", async ({ q }) => {
    const combobox = q.combobox("Go to file");
    await combobox.click();

    const popover = q.dialog("Go to file results");
    await test.expect(popover).toBeVisible();
    await test.expect(combobox).toHaveAttribute("aria-haspopup", "dialog");

    const tree = query(popover).tree("Files");
    await test.expect(query(tree).treeitem()).toHaveCount(4);
    await test.expect(query(popover).status()).toHaveText("4 of 4 files");

    // The nested list re-renders on every keystroke, so the popup role must
    // survive both a filtered and an empty result set.
    await combobox.fill("app");
    await test.expect(query(popover).status()).toHaveText("1 of 4 files");
    await test.expect(query(tree).treeitem("app.tsx")).toBeVisible();
    await test.expect(combobox).toHaveAttribute("aria-haspopup", "dialog");

    await combobox.fill("appzzz");
    await test.expect(query(popover).status()).toHaveText("0 of 4 files");
    await test.expect(query(tree).treeitem()).toHaveCount(0);
    await test.expect(combobox).toHaveAttribute("aria-haspopup", "dialog");
  });

  // https://github.com/ariakit/ariakit/issues/7302
  test("nested menu list owns the popup role", async ({ q }) => {
    const combobox = q.combobox("Run command");
    await combobox.click();

    const popover = q.dialog("Command results");
    await test.expect(popover).toBeVisible();
    await test.expect(combobox).toHaveAttribute("aria-haspopup", "dialog");

    const menu = query(popover).menu("Commands");
    await test.expect(query(menu).menuitem()).toHaveCount(3);
  });

  // https://github.com/ariakit/ariakit/issues/7302
  test("unrelated listbox does not take the popup role", async ({ q }) => {
    const combobox = q.combobox("Search fruits");
    await combobox.click();

    const popover = q.listbox("Fruit results");
    await test.expect(popover).toBeVisible();
    await test.expect(combobox).toHaveAttribute("aria-haspopup", "listbox");
    await test.expect(query(popover).option("Apple")).toBeVisible();
    await test.expect(query(popover).listbox("Recently used")).toBeVisible();
  });
});
