import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("keeps typeahead characters scoped to each composite instance", async ({
    page,
    q,
  }) => {
    await page.keyboard.press("Tab");
    await test.expect(q.button("Alpha")).toBeFocused();

    await page.keyboard.press("a");
    await test.expect(q.button("Alpine")).toBeFocused();

    await page.keyboard.press("p");
    await test.expect(q.button("Apricot")).toBeFocused();

    // Move to the second composite while the first composite's "ap" buffer is
    // still alive (typed within the 500ms cleanup window). With a per-instance
    // buffer the next "b" matches Banana; a leaked global buffer would turn it
    // into "apb", match nothing, and leave focus on Cherry.
    await q.button("Cherry").focus();
    await test.expect(q.button("Cherry")).toBeFocused();

    await page.keyboard.press("b");
    await test.expect(q.button("Banana")).toBeFocused();
  });
});
