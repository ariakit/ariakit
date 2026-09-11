import { flushFrames } from "#app/test-utils/preview.ts";
import { withGalleryPage } from "./gallery-test-utils.ts";

withGalleryPage("combobox-fixtures", async ({ test }) => {
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
    // On this long fixture page, hover() can scroll the option into view, and
    // the scroll event arrives on a later frame. It resets Ariakit's
    // mouse-movement tracker, which would make the option ignore the moves
    // below, so let it fire first.
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
    // The combobox-item-highlight list stays open on this route, so the query
    // names the list that closes.
    await test.expect(q.listbox("Assignee")).not.toBeVisible();
  });
});
