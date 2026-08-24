import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/7114
  test("keeps platform select-all native in the editable combobox", async ({
    page,
    q,
  }) => {
    const combobox = q.combobox("Your favorite food");
    await combobox.fill("apple");
    await test.expect(q.option("Apple")).toBeVisible();

    const isMac = await page.evaluate(() =>
      navigator.platform.startsWith("Mac"),
    );
    const modifier = isMac ? "Meta" : "Control";
    await combobox.press(`${modifier}+A`);

    const selectionRange = await combobox.evaluate((element) => {
      if (!(element instanceof HTMLInputElement)) return null;
      return [element.selectionStart, element.selectionEnd];
    });
    test.expect(selectionRange).toEqual([0, 5]);
    await test
      .expect(q.status("Editable selection"))
      .toHaveText("1 selected: Bacon");
  });
});
