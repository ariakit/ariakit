import { q, type } from "@ariakit/test";
import { expect, test } from "vitest";

test("useStoreState reads state through a provider component", async () => {
  await expect
    .poll(() => q.status.ensure("Combobox value").textContent)
    .toBe("Apple");

  // Typing updates the combobox store, and the readout reflects it live
  // through the provider component passed to `useStoreState`.
  await type("s", q.combobox.ensure("Fruit"));

  await expect
    .poll(() => q.status.ensure("Combobox value").textContent)
    .toBe("Apples");
});

test("provider components have no fallback: useStoreState is undefined outside a matching provider", async () => {
  // `OutsideStatus` reads `useStoreState(ComboboxProvider, "value")` while
  // rendered outside every ComboboxProvider, so it must resolve to undefined
  // (shown as "none") even though a ComboboxProvider exists elsewhere.
  await expect
    .poll(() => q.status.ensure("Outside combobox value").textContent)
    .toBe("none");
});

test("CompositeItem store={ComboboxProvider} binds to the combobox, not the closer toolbar", async () => {
  // The `Focus first option` item is nested inside the Toolbar (its closest
  // composite context) but explicitly targets the ComboboxProvider, so it
  // registers with the combobox instead of the toolbar.
  await expect
    .poll(() => q.status.ensure("Combobox items").textContent)
    .toBe("1");
  await expect
    .poll(() => q.status.ensure("Toolbar items").textContent)
    .toBe("1");

  // Both items render as buttons regardless of which store they belong to.
  expect(q.button("Clear")).toBeInTheDocument();
  expect(q.button("Focus first option")).toBeInTheDocument();
});
