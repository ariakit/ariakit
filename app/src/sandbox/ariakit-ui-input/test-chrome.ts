import type { Locator } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

// A text query finds the text part inside an error, so find the error from the
// first id in the description of its field.
async function getFieldError(field: Locator) {
  const description = await field.getAttribute("aria-describedby");
  const [errorId] = description?.split(" ") ?? [];
  return field.page().locator(`[id="${errorId}"]`);
}

withFramework(import.meta.dirname, async ({ query, test }) => {
  // https://github.com/ariakit/ariakit/pull/7491#discussion_r4000613090
  test("tabs through composed fields without stopping on their wrappers", async ({
    page,
    q,
  }) => {
    for (const [title, name] of [
      ["Field with leading icon", "Filter components"],
      ["Grouped Input", "Handle"],
      ["Share link with copy button", "Share link"],
    ]) {
      const box = query(q.article(title));
      await box.button("More info").focus();
      await page.keyboard.press("Tab");
      await test.expect(box.textbox(name)).toBeFocused();
    }
    await page.keyboard.press("Tab");
    await test.expect(q.button("Copy")).toBeFocused();
  });

  test("names a field from the label around it", async ({ q }) => {
    const field = query(q.article("Small")).textbox("Postal code");
    await test.expect(field).toBeEditable();
  });

  test("keeps the key hint out of the search trigger name", async ({ q }) => {
    const trigger = query(q.article("Search trigger")).button("Search docs");
    await test.expect(trigger).toBeVisible();
  });

  // https://github.com/ariakit/ariakit/issues/8053
  test("replaces the error icon and keeps its label out of the description", async ({
    q,
  }) => {
    const box = query(q.article("Error with another icon"));
    const error = await getFieldError(box.textbox("Account email"));
    await test.expect(error).toHaveText("This account is locked.");
    await test.expect(error.locator("svg")).toHaveCount(1);
    await test.expect(error.locator("svg[aria-label='Locked']")).toHaveCount(1);
    await test
      .expect(box.textbox("Account email"))
      .toHaveAccessibleDescription("This account is locked.");
  });

  // The page capture shows that the empty panel paints no box.
  test("keeps the alert of an empty error panel until its text shows", async ({
    page,
    q,
  }) => {
    const box = query(q.article("Error on a panel that shows on blur"));
    const field = box.textbox("Username");
    // The live region is in the accessibility tree before its text.
    const error = box.alert();
    await test.expect(error).toBeEmpty();
    await field.focus();
    await page.keyboard.press("Tab");
    await test.expect(error).toHaveText("Remove the spaces.");
    await test.expect(error.locator("svg")).toHaveCount(1);
    await test.expect(field).toHaveAccessibleDescription("Remove the spaces.");
  });

  // https://github.com/ariakit/ariakit/pull/7491#discussion_r3997757472
  test("focuses the share link from the padded field surface", async ({
    q,
  }) => {
    const input = q.textbox("Share link");
    const field = input.locator("xpath=../..");
    const copy = q.button("Copy");
    const box = await field.boundingBox();
    test.expect(box).not.toBeNull();
    if (!box) return;
    for (const position of [
      { x: box.width / 2, y: 2 },
      { x: box.width / 2, y: box.height - 2 },
      { x: 2, y: box.height / 2 },
    ]) {
      await copy.click();
      await test.expect(copy).toBeFocused();
      await field.click({ position });
      await test.expect(input).toBeFocused();
    }
    await copy.click();
    await test.expect(copy).toBeFocused();
    await test.expect(input).not.toBeFocused();
  });
});
