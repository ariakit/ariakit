import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("useStoreStateObject reads state through a provider component", async ({
    page,
    q,
  }) => {
    await test.expect(q.status("Combobox value")).toHaveText("Apple");

    // Typing updates the combobox store, and the readout reflects it live
    // through the provider component passed to `useStoreStateObject`.
    await q.combobox("Fruit").click();
    await page.keyboard.type("s");

    await test.expect(q.status("Combobox value")).toHaveText("Apples");
  });

  test("CompositeItem store={ComboboxProvider} binds to the combobox, not the closer toolbar", async ({
    q,
  }) => {
    // The `Combobox item` item is nested inside the Toolbar but explicitly
    // targets the ComboboxProvider, so it registers with the combobox instead
    // of the toolbar.
    await test.expect(q.status("Combobox items")).toHaveText("1");
    await test.expect(q.status("Toolbar items")).toHaveText("1");
    await test.expect(q.button("Clear")).toBeVisible();
    await test.expect(q.button("Combobox item")).toBeVisible();
  });

  test("provider components have no fallback: useStoreState is undefined outside a matching provider", async ({
    q,
  }) => {
    // `OutsideStatus` reads useStoreState(ComboboxProvider) while rendered
    // outside every ComboboxProvider, so it resolves to undefined ("none").
    await test.expect(q.status("Outside combobox value")).toHaveText("none");
  });

  test("provider components have no fallback: CollectionItem store={ComboboxProvider} skips the closer collection outside a matching provider", async ({
    q,
  }) => {
    // The outside collection renders one plain CollectionItem plus a
    // CollectionItem that targets ComboboxProvider. No ComboboxProvider wraps
    // that region, and provider components have no fallback, so the second
    // item must not register with the closer collection: the count stays at
    // the plain item.
    await test.expect(q.status("Outside collection items")).toHaveText("1");
    await test.expect(q.button("Outside combobox item")).toBeVisible();
  });
});
