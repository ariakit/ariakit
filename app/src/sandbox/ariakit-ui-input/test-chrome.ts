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
  // https://github.com/ariakit/ariakit/pull/7491#discussion_r4001106872
  test("does not focus the field when its help popup is clicked", async ({
    q,
  }) => {
    const field = q.textbox("Contact email");
    const help = q.text(
      "Use the email address where you want to receive updates.",
    );
    await q.button("Email help").click();
    await test.expect(help).toBeVisible();
    await help.click();
    await test.expect(field).not.toBeFocused();
    await test.expect(help).toBeVisible();
  });

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

  // https://github.com/ariakit/ariakit/pull/7491#discussion_r4000613090
  test("does not focus a disabled field from its wrapper", async ({ q }) => {
    const field = q.textbox("Filter components");
    await field.evaluate((node) => node.setAttribute("disabled", ""));
    await field.locator("xpath=..").click({ position: { x: 4, y: 4 } });
    await test.expect(field).not.toBeFocused();
    await test.expect(field.locator("xpath=..")).not.toBeFocused();
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
  test("marks an error with an icon unless the icon is removed", async ({
    q,
  }) => {
    const marked = await getFieldError(
      query(q.article("Error with a long message")).textbox("Email"),
    );
    await test
      .expect(marked)
      .toHaveText(
        "Another account uses this address. Sign in or use a different address.",
      );
    await test.expect(marked.locator("svg")).toHaveCount(1);
    const unmarked = await getFieldError(
      query(q.article("Error without an icon")).textbox("Verification code"),
    );
    await test.expect(unmarked).toHaveText("The code has 6 digits.");
    // No hidden icon part either, so the text starts at the edge, like the
    // hint.
    await test.expect(unmarked.locator("[aria-hidden]")).toHaveCount(0);
    await test.expect(unmarked.locator("svg")).toHaveCount(0);
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

  // https://github.com/ariakit/ariakit/issues/8053
  test("removes the error icon when the error text clears", async ({ q }) => {
    for (const [title, name, value] of [
      ["Error that clears", "Work email", "ada.lovelace@example.com"],
      ["Error that keeps its line", "Phone", "555 0123"],
    ] as const) {
      const field = query(q.article(title)).textbox(name);
      // The error keeps its element, so the text query would no longer find it
      // once the text clears.
      const error = await getFieldError(field);
      await test.expect(error.locator("svg")).toHaveCount(1);
      await field.fill(value);
      await test.expect(field).not.toHaveAttribute("aria-invalid");
      await test.expect(error).toBeAttached();
      await test.expect(error.locator("svg")).toHaveCount(0);
    }
  });

  // https://github.com/ariakit/ariakit/issues/8053
  test("shows the error icon when an error appears on blur", async ({
    page,
    q,
  }) => {
    const box = query(q.article("Error that shows on blur"));
    const field = box.textbox("Username");
    const error = box.alert();
    await test.expect(error).toBeEmpty();
    await test.expect(error.locator("svg")).toHaveCount(0);
    await field.focus();
    await page.keyboard.press("Tab");
    await test.expect(error).toHaveText("Remove the spaces.");
    await test.expect(error.locator("svg")).toHaveCount(1);
    await test.expect(field).toHaveAccessibleDescription("Remove the spaces.");
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

  // https://github.com/ariakit/ariakit/pull/7491#discussion_r4001176828
  test("skips a leading action when focusing the field from group padding", async ({
    q,
  }) => {
    const field = q.textbox("Draft message");
    await field.locator("xpath=..").click({ position: { x: 4, y: 4 } });
    await test.expect(field).toBeFocused();
    await q.button("Clear").click();
    await test.expect(q.button("Clear")).toBeFocused();
    await test.expect(field).not.toBeFocused();
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
