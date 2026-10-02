import type { Page } from "@playwright/test";
import {
  captureInView,
  forEachColorScheme,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";
import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
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
});

withFramework(import.meta.dirname, async ({ query, test }) => {
  // Reads the system colors in the same engine, so the tests do not depend on
  // the platform's forced-colors palette. The probe lives in the body so that
  // no rule of the item applies to it.
  const readSystemColors = (page: Page) =>
    page.evaluate(() => {
      const probe = document.createElement("div");
      probe.style.backgroundColor = "Highlight";
      probe.style.color = "HighlightText";
      document.body.append(probe);
      const { backgroundColor, color } = getComputedStyle(probe);
      probe.remove();
      return { backgroundColor, color };
    });

  // https://github.com/ariakit/ariakit/issues/7518
  test("keeps the active option highlighted in forced colors", async ({
    page,
    q,
  }) => {
    const input = q.combobox("Destination");
    await input.click();
    await input.press("ArrowDown");
    await page.emulateMedia({ forcedColors: "active" });
    await input.press("ArrowDown");
    const list = query(q.listbox("Destination"));
    const active = list.option("Australia");
    await test.expect(active).toHaveAttribute("data-active-item", "true");
    const expected = await readSystemColors(page);
    const actual = await active.evaluate((el) => {
      const { backgroundColor, color, forcedColorAdjust } =
        getComputedStyle(el);
      const label = el.firstElementChild;
      return {
        backgroundColor,
        color,
        labelColor: label && getComputedStyle(label).color,
        // With the automatic adjustment, the browser paints a Canvas backplate
        // behind the text that hides HighlightText. Computed colors cannot show
        // that backplate, so this stands in for it.
        forcedColorAdjust,
      };
    });
    test.expect(actual).toEqual({
      ...expected,
      labelColor: expected.color,
      forcedColorAdjust: "none",
    });
  });

  // https://github.com/ariakit/ariakit/issues/7518
  test("keeps the nested text of the active option legible in forced colors", async ({
    page,
    q,
  }) => {
    await page.emulateMedia({ forcedColors: "active" });
    const input = q.combobox("Member");
    await input.click();
    await input.press("ArrowDown");
    const active = query(q.listbox("Member")).option(/^Ava Thompson/);
    await test.expect(active).toHaveAttribute("data-active-item", "true");
    const expected = await readSystemColors(page);
    await test
      .expect(active.locator(".control-description"))
      .toHaveCSS("color", expected.color);
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
