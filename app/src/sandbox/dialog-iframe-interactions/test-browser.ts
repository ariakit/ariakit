import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  // https://github.com/ariakit/ariakit/issues/3031
  test("hides the popover when focus moves to the parent document", async ({
    page,
    q,
  }) => {
    const frame = query(page.frameLocator("iframe[title='Embedded combobox']"));
    await frame.combobox("Favorite food").click();
    await test.expect(frame.listbox("Suggestions")).toBeVisible();

    await page.keyboard.press("Tab");

    await test.expect(q.textbox("Parent target")).toBeFocused();
    await test.expect(frame.listbox("Suggestions")).not.toBeVisible();
  });

  test("toggles an iframe popover from its parent disclosure", async ({
    page,
    q,
  }) => {
    const frame = query(page.frameLocator("iframe[title='Embedded combobox']"));
    const disclosure = q.button("Toggle iframe popover");

    await disclosure.click();
    await test.expect(frame.dialog("Iframe popover")).toBeVisible();
    await disclosure.click();

    await test.expect(frame.dialog("Iframe popover")).not.toBeVisible();
  });

  test("keeps the iframe popover open when dragging from its parent disclosure", async ({
    page,
    q,
  }) => {
    const frame = query(page.frameLocator("iframe[title='Embedded combobox']"));
    const disclosure = q.button("Toggle iframe popover");
    await disclosure.click();
    await test.expect(frame.dialog("Iframe popover")).toBeVisible();

    await disclosure.dragTo(q.textbox("Parent target"));

    await test.expect(frame.dialog("Iframe popover")).toBeVisible();
  });

  // https://github.com/ariakit/ariakit/issues/3250
  test("hides the popover when clicking an existing sibling iframe", async ({
    page,
    q,
  }) => {
    const outsideFrame = query(
      page.frameLocator("iframe[title='Outside frame']"),
    );
    await q.button("Open root popover").click();
    await test.expect(q.dialog("Root popover")).toBeVisible();

    const outsideInput = outsideFrame.textbox("Outside frame target");
    await outsideInput.focus();
    await test.expect(outsideInput).toBeFocused();
    await outsideInput.click();

    await test.expect(q.dialog("Root popover")).not.toBeVisible();
    await test.expect(outsideInput).toBeFocused();
  });

  // https://github.com/ariakit/ariakit/issues/3031
  test("hides the popover when a sibling frame reuses the disclosure ID", async ({
    page,
  }) => {
    const frame = query(page.frameLocator("iframe[title='Embedded combobox']"));
    const outsideFrame = query(
      page.frameLocator("iframe[title='Outside frame']"),
    );
    await frame.combobox("Favorite food").click();
    await test.expect(frame.listbox("Suggestions")).toBeVisible();

    const outsideCombobox = outsideFrame.combobox(
      "Outside active descendant target",
    );
    await outsideCombobox.focus();

    await test.expect(outsideCombobox).toBeFocused();
    await test.expect(frame.listbox("Suggestions")).not.toBeVisible();
  });

  // https://github.com/ariakit/ariakit/issues/3250
  test("hides the popover when clicking a bodyless frame document", async ({
    page,
    q,
  }) => {
    const svg = page
      .frameLocator("iframe[title='Outside SVG frame']")
      .locator("svg");
    await test.expect(svg).toBeVisible();
    await q.button("Open root popover").click();
    await test.expect(q.dialog("Root popover")).toBeVisible();

    await svg.click();

    await test.expect(q.dialog("Root popover")).not.toBeVisible();
  });

  // https://github.com/ariakit/ariakit/issues/3250
  test("keeps the popover open when clicking an existing contained iframe", async ({
    page,
    q,
  }) => {
    const containedFrame = query(
      page.frameLocator("iframe[title='Contained frame']"),
    );
    await q.button("Open root popover").click();
    await test.expect(q.dialog("Root popover")).toBeVisible();

    await containedFrame.button("Contained frame target").click();
    await page.waitForTimeout(250);

    await test.expect(q.dialog("Root popover")).toBeVisible();
  });
});
