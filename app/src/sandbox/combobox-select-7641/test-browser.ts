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

  // The searchable popup is portaled out of the shadow root, so its search
  // input, the composite element there, is in the document.
  const heldSelects = [
    { label: "Held fruit", popupRole: "listbox" },
    { label: "Held searchable fruit", popupRole: "dialog" },
  ] as const;

  for (const { label, popupRole } of heldSelects) {
    // Inside a shadow root, the document reports the shadow host as the focused
    // element, so a presentation that checks focus there can't see focus moving
    // to another control in the same shadow root.
    // https://github.com/ariakit/ariakit/pull/7655#discussion_r4119860242
    test(`abandons the reopen presentation when focus moves elsewhere in the shadow root (${label})`, async ({
      q,
    }) => {
      const select = q.combobox(label);
      const popup = q[popupRole](`${label} options`);
      const finish = q.button(`Finish ${label} positioning`);
      // Opening a select that already has focus is the path that presents the
      // selected item without a focus event.
      await select.focus();
      await select.click();
      await test.expect(select).toHaveAttribute("aria-expanded", "true");
      await test.expect(popup).toHaveAttribute("data-placing");
      test.expect(await popup.evaluate((element) => element.scrollTop)).toBe(0);

      // Clicking the button moves focus before its click handler finishes
      // positioning, which is what would wake the pending presentation.
      await finish.click();
      await test.expect(finish).toBeFocused();
      // The store wakes the presentation synchronously when positioning ends,
      // before React removes this attribute, so the scroll has run by now.
      await test.expect(popup).not.toHaveAttribute("data-placing");
      test.expect(await popup.evaluate((element) => element.scrollTop)).toBe(0);
      await test.expect(q.option("Lemon")).not.toBeInViewport();
    });
  }
});
