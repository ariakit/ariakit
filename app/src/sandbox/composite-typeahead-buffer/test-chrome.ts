import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("keeps typeahead characters scoped to each composite instance", async ({
    page,
    q,
  }) => {
    await page.keyboard.press("Tab");
    await test.expect(q.button("Alpha")).toBeFocused();

    // Build the "ap" buffer in the first composite, jump to the second
    // composite, and type there back-to-back, with no awaited assertion in
    // between, so the first composite's 500ms typeahead cleanup can't fire
    // before the decisive keypress. With a per-instance buffer the "b" matches
    // Banana; a leaked global buffer would still hold "ap", turn this into
    // "apb", match nothing, and leave focus on Cherry.
    await page.keyboard.press("a");
    await page.keyboard.press("p");
    await q.button("Cherry").focus();
    await page.keyboard.press("b");

    await test.expect(q.button("Banana")).toBeFocused();
  });
});
