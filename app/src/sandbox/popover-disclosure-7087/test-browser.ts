import type { query } from "@ariakit/test/playwright";
import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

type Query = ReturnType<typeof query>;

withFramework(import.meta.dirname, async ({ test }) => {
  // The first PopoverDisclosure claims the store at mount, so opening from
  // "Quick format" first moves the incumbent off that default and makes each
  // test's expected opener a genuine outcome rather than the mount default.
  const openFromQuickFormatAndClose = async (q: Query) => {
    await q.button("Quick format").click();
    await test.expect(q.dialog("Formatting")).toBeVisible();
    await q.button("Quick format").click();
    await test.expect(q.dialog("Formatting")).not.toBeVisible();
  };

  // https://github.com/ariakit/ariakit/issues/7087
  test("names the Formatting button as the opener of a programmatic open", async ({
    q,
  }) => {
    await openFromQuickFormatAndClose(q);

    const note = q.textbox("Note");
    await note.click();
    await note.press("*");

    await test.expect(q.dialog("Formatting")).toBeVisible();
    await test.expect(note).toBeFocused();
    await test
      .expect(q.button("Formatting"))
      .toHaveAttribute("aria-expanded", "true");
    await test
      .expect(q.button("Quick format"))
      .toHaveAttribute("aria-expanded", "false");

    // The popup takes its outside state from the named button, so the note the
    // caret sits in is outside and clicking it dismisses the popup.
    await note.click();
    await test.expect(q.dialog("Formatting")).not.toBeVisible();
  });

  // https://github.com/ariakit/ariakit/issues/7087
  test("returns focus to the named button when dismissed from inside", async ({
    q,
  }) => {
    await openFromQuickFormatAndClose(q);

    const note = q.textbox("Note");
    await note.click();
    await note.press("*");
    await test.expect(q.dialog("Formatting")).toBeVisible();

    await q.button("Done").click();
    await test.expect(q.dialog("Formatting")).not.toBeVisible();
    await test.expect(q.button("Formatting")).toBeFocused();
  });

  // The named button holds the store, but the popup still marks the caret's
  // field as outside itself, so Escape from there dismisses it. This is the one
  // consequence computed from the store when the popup opens rather than read
  // live, which is why the issue measured a deferred assignment losing it.
  // https://github.com/ariakit/ariakit/issues/7087
  test("dismisses with Escape from the field the caret is in", async ({
    q,
  }) => {
    await openFromQuickFormatAndClose(q);

    const note = q.textbox("Note");
    await note.click();
    await note.press("*");
    await test.expect(q.dialog("Formatting")).toBeVisible();

    await note.press("Escape");
    await test.expect(q.dialog("Formatting")).not.toBeVisible();
  });

  // A mounted button already claims the store, and the store can't tell that
  // apart from the application assigning the same button. So a show() that
  // names nothing keeps the button rather than the element that happened to be
  // focused, which also anchors the popup to that button and returns focus
  // there on close.
  // https://github.com/ariakit/ariakit/issues/7087
  test("keeps a mounted button as the opener when the open names none", async ({
    q,
  }) => {
    await openFromQuickFormatAndClose(q);

    await q.button("Suggest formatting").click();
    await test.expect(q.dialog("Formatting")).toBeVisible();
    await test
      .expect(q.button("Quick format"))
      .toHaveAttribute("aria-expanded", "true");
    await test
      .expect(q.button("Formatting"))
      .toHaveAttribute("aria-expanded", "false");
  });

  test("falls back to the focused field when no button is mounted", async ({
    page,
    q,
  }) => {
    const note = q.textbox("Note");
    const title = q.textbox("Title");
    await note.click();
    await note.press("/");
    await test.expect(q.dialog("Suggestions")).toBeVisible();

    // The note opened the popup, so clicking it is not an outside interaction.
    await note.click();
    // Nothing observable marks the moment an outside interaction would have
    // dismissed the popup, so cross that window before asserting it stayed
    // open.
    await flushFrames(page);
    await test.expect(q.dialog("Suggestions")).toBeVisible();

    await title.click();
    await test.expect(q.dialog("Suggestions")).not.toBeVisible();

    // Reopening from the title hands the popup a new opener, so now it's the
    // title that no longer counts as outside. A fix that simply kept any opener
    // it found would leave the note in place and dismiss the popup here.
    await title.press("/");
    await test.expect(q.dialog("Suggestions")).toBeVisible();
    await title.click();
    // Same as above: nothing observable marks the dismissal that must not
    // happen.
    await flushFrames(page);
    await test.expect(q.dialog("Suggestions")).toBeVisible();
  });
});
