import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("useStoreState reads state through a provider component", async ({
    page,
    q,
  }) => {
    await test.expect(q.status("Combobox value")).toHaveText("Apple");

    // Typing updates the combobox store, and the readout reflects it live
    // through the provider component passed to `useStoreState`.
    await q.combobox("Fruit").click();
    await page.keyboard.type("s");

    await test.expect(q.status("Combobox value")).toHaveText("Apples");
  });

  test("CompositeItem store={ComboboxProvider} binds to the combobox, not the closer toolbar", async ({
    q,
  }) => {
    // The `Focus first option` item is nested inside the Toolbar but explicitly
    // targets the ComboboxProvider, so it registers with the combobox instead
    // of the toolbar.
    await test.expect(q.status("Combobox items")).toHaveText("1");
    await test.expect(q.status("Toolbar items")).toHaveText("1");
    await test.expect(q.button("Clear")).toBeVisible();
    await test.expect(q.button("Focus first option")).toBeVisible();
  });

  test("provider components have no fallback: useStoreState is undefined outside a matching provider", async ({
    q,
  }) => {
    // `OutsideStatus` reads useStoreState(ComboboxProvider) while rendered
    // outside every ComboboxProvider, so it resolves to undefined ("none").
    await test.expect(q.status("Outside combobox value")).toHaveText("none");
  });
});
