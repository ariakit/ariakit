import { withFramework } from "#app/test-utils/preview.ts";
import { expectVerticallyCentered } from "#app/test-utils/scroll.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  for (const label of ["Fruit", "Fruit without initial focus"]) {
    // https://github.com/ariakit/ariakit/issues/7641
    test(`moves the active item with arrow keys in a shadow root (${label})`, async ({
      page,
      q,
    }) => {
      const select = q.combobox(label);
      await select.click();
      await test.expect(select).toHaveAttribute("aria-expanded", "true");
      await test.expect(q.option("Lemon")).toHaveAttribute("data-active-item");

      await page.keyboard.press("ArrowUp");
      await test
        .expect(q.option("Kumquat"))
        .toHaveAttribute("data-active-item");
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("ArrowDown");
      await test.expect(q.option("Lime")).toHaveAttribute("data-active-item");
      await test.expect(select).toBeFocused();
    });

    // https://github.com/ariakit/ariakit/issues/7641
    test(`closes the popup with Escape in a shadow root (${label})`, async ({
      page,
      q,
    }) => {
      const select = q.combobox(label);
      await select.click();
      await test.expect(select).toHaveAttribute("aria-expanded", "true");

      await page.keyboard.press("Escape");
      await test.expect(select).toHaveAttribute("aria-expanded", "false");
      await test.expect(q.listbox()).toHaveCount(0);
      await test.expect(select).toBeFocused();
    });
  }

  // https://github.com/ariakit/ariakit/issues/7641
  test("centers a new selection when a focused select in a shadow root reopens a popup without initial focus", async ({
    page,
    q,
  }) => {
    const select = q.combobox("Fruit without initial focus");
    const pineapple = q.option("Pineapple");
    await select.click();
    await expectVerticallyCentered(q.listbox(), q.option("Lemon"));
    for (let i = 0; i < 10; i += 1) {
      await page.keyboard.press("ArrowDown");
    }
    await test.expect(pineapple).toHaveAttribute("data-active-item");
    await page.keyboard.press("Enter");
    await test.expect(select).toHaveAttribute("aria-expanded", "false");
    await test.expect(select).toHaveText("Pineapple");

    // The select keeps focus while its popup is closed, so this reopen fires no
    // focus event, and the list stays where the previous open left it.
    await select.click();
    await test.expect(select).toHaveAttribute("aria-expanded", "true");
    await test.expect(pineapple).toHaveAttribute("data-active-item");
    await expectVerticallyCentered(q.listbox(), pineapple);
    await test.expect(select).toBeFocused();
  });
});
