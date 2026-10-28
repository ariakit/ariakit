import type { query } from "@ariakit/test/playwright";
import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

type Query = ReturnType<typeof query>;

withFramework(import.meta.dirname, async ({ test }) => {
  // The last PopoverDisclosure to mount claims the store, which here is
  // "Formatting". Opening from "Quick format" first moves the incumbent off
  // that default, so each test's expected opener is a genuine outcome rather
  // than whichever button happened to mount last.
  const openFromQuickFormatAndClose = async (q: Query) => {
    await q.button("Quick format").click();
    await test.expect(q.dialog("Formatting")).toBeVisible();
    // Pins that this button, not "Formatting", holds the store when each test
    // below starts, so naming "Formatting" there is a real change.
    await test
      .expect(q.button("Quick format"))
      .toHaveAttribute("aria-expanded", "true");
    await q.button("Quick format").click();
    await test.expect(q.dialog("Formatting")).not.toBeVisible();
  };

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

  // An open with nothing focused captures nothing, so the field captured by an
  // earlier open stays in the store without having been named. The next open
  // must still treat it as a stale fallback rather than as somebody's choice.
  // https://github.com/ariakit/ariakit/issues/7087
  test("replaces the fallback after an open that captured nothing", async ({
    page,
    q,
  }) => {
    const note = q.textbox("Note");
    const title = q.textbox("Title");
    await note.click();
    await note.press("/");
    await test.expect(q.dialog("Suggestions")).toBeVisible();
    await note.press("Escape");
    await test.expect(q.dialog("Suggestions")).not.toBeVisible();

    await q.button("Summarize note").click();
    await test.expect(q.dialog("Suggestions")).toBeVisible();
    // The button dropped focus, so this Escape comes from the body.
    await page.keyboard.press("Escape");
    await test.expect(q.dialog("Suggestions")).not.toBeVisible();

    await title.click();
    await title.press("/");
    await test.expect(q.dialog("Suggestions")).toBeVisible();
    await title.click();
    // Nothing observable marks the dismissal that must not happen, so cross
    // that window before asserting the title is the opener rather than the
    // note.
    await flushFrames(page);
    await test.expect(q.dialog("Suggestions")).toBeVisible();
  });
});
