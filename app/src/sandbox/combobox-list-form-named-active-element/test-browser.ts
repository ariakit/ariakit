import { withFramework } from "#app/test-utils/preview.ts";

// happy-dom implements no document named getter, so only a real browser makes
// the form answer the `activeElement` read. The three desktop projects all
// reproduce it.
withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/7230
  test("moves focus from the list to the combobox past a named activeElement form", async ({
    q,
  }) => {
    const focusHistory = q.status("Focus history");
    await test.expect(focusHistory).toHaveText("none");

    // Click the list's own padding band. A centered click would land on an
    // item and exercise the composite item redirect instead of the list one.
    await q.listbox("Fruit options").click({ position: { x: 8, y: 8 } });

    await test.expect(focusHistory).toHaveText("list → combobox");
  });
});
