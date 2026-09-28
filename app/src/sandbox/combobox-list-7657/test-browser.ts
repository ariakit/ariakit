import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  const lists = [
    { label: "Popover fruit", prefix: "Popover" },
    { label: "List fruit", prefix: "List" },
  ];

  for (const { label, prefix } of lists) {
    // Inside a shadow root, the document reports the shadow host as the focused
    // element, so a check for focus on the list itself can't see it.
    // https://github.com/ariakit/ariakit/issues/7657
    test(`returns focus from the list to the combobox in a shadow root (${label})`, async ({
      page,
      q,
    }) => {
      const combobox = q.combobox(label);
      await combobox.click();
      await test.expect(combobox).toHaveAttribute("aria-expanded", "true");

      // The padding around the items belongs to the list, not to an item.
      await q.listbox(`${label} options`).click({ position: { x: 4, y: 4 } });
      await test.expect(combobox).toBeFocused();

      await page.keyboard.press("ArrowDown");
      await test.expect(combobox).toBeFocused();
      await test
        .expect(q.option(`${prefix} Apple`))
        .toHaveAttribute("data-active-item");
      await page.keyboard.press("ArrowDown");
      await test
        .expect(q.option(`${prefix} Banana`))
        .toHaveAttribute("data-active-item");
    });
  }
});
