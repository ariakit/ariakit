import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/7093
  // Withholding focus must not also withhold the rest of the presentation: a
  // list that is already on screen still belongs at the active item.
  test("typeahead scrolls a collapsed list to the active item", async ({
    q,
  }) => {
    const select = q.combobox("Code");
    const list = q.listbox("Code options");
    const scrollTop = () => list.evaluate((element) => element.scrollTop);

    await select.focus();
    test.expect(await scrollTop()).toBe(0);

    await select.press("z");

    const zulu = q.option("Zulu");
    await test.expect(zulu).toHaveAttribute("data-active-item");
    await test.expect.poll(scrollTop).toBeGreaterThan(0);
    await test.expect(zulu).toBeInViewport();
    await test.expect(select).toBeFocused();
  });
});
