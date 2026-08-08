import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/7083
  test("announces the popover disclosure as expanded when another element owns focus", async ({
    page,
    q,
  }) => {
    const share = q.button("Share");
    const note = q.textbox("Note");
    await note.click();
    await test.expect(note).toBeFocused();
    await test.expect(share).toHaveAttribute("aria-expanded", "false");

    await page.keyboard.press("F2");

    await test.expect(q.dialog("Share note")).toBeVisible();
    await test.expect(share).toHaveAttribute("aria-expanded", "true");

    // The collapse half of the round trip, so a trigger that stops depending
    // on the disclosure element cannot get there by announcing itself expanded
    // unconditionally.
    await q.button("Close share").click();

    await test.expect(q.dialog("Share note")).not.toBeAttached();
    await test.expect(share).toHaveAttribute("aria-expanded", "false");
    // Returning the user to where they were typing is the supported behavior
    // for an open that never passed through a trigger, so a fix must correct
    // the announced state without moving the disclosure element that decides
    // this.
    await test.expect(note).toBeFocused();
  });

  // https://github.com/ariakit/ariakit/issues/7083
  test("announces the dialog disclosure as expanded when another element owns focus", async ({
    page,
    q,
  }) => {
    const settings = q.button("Settings");
    const note = q.textbox("Note");
    await note.click();
    await test.expect(note).toBeFocused();
    await test.expect(settings).toHaveAttribute("aria-expanded", "false");

    await page.keyboard.press("F4");

    await test.expect(q.dialog("Settings")).toBeVisible();
    await test.expect(settings).toHaveAttribute("aria-expanded", "true");
  });

  // https://github.com/ariakit/ariakit/issues/7083
  test("announces the menu button as expanded when another element owns focus", async ({
    page,
    q,
  }) => {
    const format = q.menuitem("Format");
    const note = q.textbox("Note");
    await note.click();
    await test.expect(note).toBeFocused();
    await test.expect(format).toHaveAttribute("aria-expanded", "false");

    await page.keyboard.press("F8");

    await test.expect(q.menu("Format")).toBeVisible();
    await test.expect(format).toHaveAttribute("aria-expanded", "true");
  });

  // https://github.com/ariakit/ariakit/issues/7083
  test("announces the select as expanded when another element owns focus", async ({
    page,
    q,
  }) => {
    const status = q.combobox("Status");
    const note = q.textbox("Note");
    await note.click();
    await test.expect(note).toBeFocused();
    await test.expect(status).toHaveAttribute("aria-expanded", "false");

    await page.keyboard.press("F9");

    await test.expect(q.listbox()).toBeVisible();
    await test.expect(status).toHaveAttribute("aria-expanded", "true");
  });

  // Both triggers control the same section, so there is no ownership order
  // that leaves the other one telling the truth.
  // https://github.com/ariakit/ariakit/issues/7083
  test("announces every trigger that controls the same content", async ({
    q,
  }) => {
    const header = q.button("Revision history");
    const footer = q.button("Toggle revision history");
    await test.expect(header).toHaveAttribute("aria-expanded", "false");
    await test.expect(footer).toHaveAttribute("aria-expanded", "false");

    await header.click();

    await test.expect(q.text("Edited 3 times.")).toBeVisible();
    await test.expect(header).toHaveAttribute("aria-expanded", "true");
    await test.expect(footer).toHaveAttribute("aria-expanded", "true");
  });

  // Menubar triggers read each other's announced state off the DOM to decide
  // whether hovering a sibling switches menus, so a trigger that under-reports
  // its own open menu takes the switch away from every sibling.
  // https://github.com/ariakit/ariakit/issues/7083
  test("switches menus on hover after a programmatic open", async ({
    page,
    q,
  }) => {
    await q.textbox("Note").click();
    await page.keyboard.press("F8");
    await test.expect(q.menu("Format")).toBeVisible();
    await q.menuitem("Insert").hover();

    await test.expect(q.menu("Insert")).toBeVisible();
  });
});
