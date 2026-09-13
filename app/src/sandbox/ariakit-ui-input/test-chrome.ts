import { withFramework } from "#app/test-utils/preview.ts";

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

  // https://github.com/ariakit/ariakit/pull/7491#discussion_r4000613090
  test("does not focus a disabled field from its wrapper", async ({ q }) => {
    const field = q.textbox("Filter components");
    await field.evaluate((node) => node.setAttribute("disabled", ""));
    await field.locator("xpath=..").click({ position: { x: 4, y: 4 } });
    await test.expect(field).not.toBeFocused();
    await test.expect(field.locator("xpath=..")).not.toBeFocused();
  });

  test("links each hint and error message to its field", async ({ q }) => {
    const field = query(q.article("Labeled field with hint")).textbox(
      "Display name",
    );
    await test
      .expect(field)
      .toHaveAccessibleDescription("Shown on your public profile.");

    const invalid = query(q.article("Invalid")).textbox("Email");
    await test.expect(invalid).toHaveAttribute("aria-invalid", "true");
    await test
      .expect(invalid)
      .toHaveAccessibleDescription("Enter a valid email address.");
  });

  test("names a field from the label around it", async ({ q }) => {
    const field = query(q.article("Small")).textbox("Postal code");
    await test.expect(field).toBeEditable();
  });

  test("disables the disabled field", async ({ q }) => {
    const field = query(q.article("Disabled")).textbox("Username");
    await test.expect(field).toBeDisabled();
  });

  test("keeps the key hint out of the search trigger name", async ({ q }) => {
    const trigger = query(q.article("Search trigger")).button("Search docs");
    await test.expect(trigger).toBeVisible();
  });

  test("keeps the share link read-only", async ({ q }) => {
    const box = query(q.article("Share link with copy button"));
    const input = box.textbox("Share link");
    await test.expect(input).toHaveValue("ariakit.com/ui");
    await test.expect(input).not.toBeEditable();
  });

  // https://github.com/ariakit/ariakit/pull/7491#discussion_r4000613090
  test("focuses the share link from a click on its prefix", async ({ q }) => {
    const box = query(q.article("Share link with copy button"));
    await box.text("https://").click();
    await test.expect(box.textbox("Share link")).toBeFocused();
  });
});
