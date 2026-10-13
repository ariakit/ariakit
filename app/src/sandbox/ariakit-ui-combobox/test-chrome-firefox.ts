import {
  captureInView,
  forEachColorScheme,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";
import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ query, test }) => {
  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3972224343
  test("keeps the hovered suggestion active with optional hover props", async ({
    page,
    q,
  }) => {
    const input = q.combobox("Assignee");
    await input.click();
    const option = q.option("Bob");
    await option.scrollIntoViewIfNeeded();
    await option.hover();
    // On this long sandbox, hover() can scroll the option into view, and the
    // scroll event arrives on a later frame. It resets Ariakit's mouse-movement
    // tracker, which would make the option ignore the moves below, so let it
    // fire first.
    await flushFrames(page);
    const optionBox = await option.boundingBox();
    const inputBox = await input.boundingBox();
    if (!optionBox || !inputBox) {
      throw new Error("The option or the input has no bounding box");
    }
    // Unlike hover(), page.mouse.move never scrolls. This move within the
    // option counts as movement for the tracker, so the option is active and
    // the leave below counts, with no scroll left to reset the tracker.
    await page.mouse.move(optionBox.x + 4, optionBox.y + 4);
    const optionId = await option.getAttribute("id");
    test.expect(optionId).toBeTruthy();
    await test
      .expect(input)
      .toHaveAttribute("aria-activedescendant", optionId ?? "");
    await page.mouse.move(
      inputBox.x + inputBox.width / 2,
      inputBox.y + inputBox.height / 2,
    );
    await input.press("Enter");
    await test.expect(input).toHaveValue("Bob");
    // The combobox-item-highlight list stays open in this sandbox, so the query
    // names the list that closes.
    await test.expect(q.listbox("Assignee")).not.toBeVisible();
  });

  // https://github.com/ariakit/ariakit/issues/7875
  test("clears the option highlight when focus leaves the combobox", async ({
    page,
    q,
  }) => {
    const card = q.article("Open suggestions");
    const input = query(card).combobox("Snack");
    const option = query(card).option("Cashews");
    await card.evaluate((node) => {
      node.scrollIntoView({ block: "center" });
    });
    // The scroll event arrives on a later frame and resets Ariakit's
    // mouse-movement tracker, which would make the option ignore the hover
    // below, so let it fire first.
    await flushFrames(page);
    const restingBackground = await query(card)
      .option("Almonds")
      .evaluate((element) => getComputedStyle(element).backgroundColor);
    // The list is held open, so Cashews is the active option before focus
    // enters the combobox.
    await test.expect(option).toHaveAttribute("data-active-item", "true");
    await test.expect(option).toHaveCSS("background-color", restingBackground);
    // A click clears the default active option. The hover then gives the option
    // the pointer highlight instead of the keyboard focus style.
    await input.click();
    await option.hover();
    await test.expect(option).toHaveAttribute("data-focus", "true");
    await test.expect(option).not.toHaveAttribute("data-focus-visible");
    await test
      .expect(option)
      .not.toHaveCSS("background-color", restingBackground);
    await input.press("Tab");
    await test.expect(input).not.toBeFocused();
    await test.expect(option).not.toHaveAttribute("data-focus");
    await test.expect(option).toHaveAttribute("data-active-item", "true");
    await test.expect(option).toHaveCSS("background-color", restingBackground);
  });
});

withCaptures(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/pull/7500#discussion_r4000661269
  test("keeps the empty message borderless in forced colors @visual", async ({
    page,
    q,
    visual,
  }) => {
    await page.emulateMedia({ forcedColors: "active" });
    await forEachColorScheme(page, async (colorScheme) => {
      const box = q.article("Empty state");
      await captureInView({
        visual,
        box,
        colorScheme,
        item: "ariakit-ui-combobox/forced-colors/empty-message",
      });
    });
  });
});
