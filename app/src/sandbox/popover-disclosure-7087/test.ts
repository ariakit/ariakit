import { click, press, q, sleep } from "@ariakit/test";
import { expect, test } from "vitest";

// The last PopoverDisclosure to mount claims the store, which here is
// "Formatting". Opening from "Quick format" first moves the incumbent off that
// default, so each test's expected opener is a genuine outcome rather than
// whichever button happened to mount last.
async function openFromQuickFormatAndClose() {
  await click(q.button("Quick format"));
  expect(q.dialog("Formatting")).toBeVisible();
  // Pins that this button, not "Formatting", holds the store when each test
  // below starts, so naming "Formatting" there is a real change.
  expect(q.button("Quick format")).toHaveAttribute("aria-expanded", "true");
  await click(q.button("Quick format"));
  await expect.poll(q.dialog.maybe.lazy("Formatting")).not.toBeInTheDocument();
}

// https://github.com/ariakit/ariakit/issues/7087
test("names the Formatting button as the opener of a programmatic open", async () => {
  await openFromQuickFormatAndClose();

  const note = q.textbox("Note");
  await click(note);
  await press("*", note);

  expect(q.dialog("Formatting")).toBeVisible();
  expect(note).toHaveFocus();
  expect(q.button("Formatting")).toHaveAttribute("aria-expanded", "true");
  expect(q.button("Quick format")).toHaveAttribute("aria-expanded", "false");

  // The popup takes its outside state from the named button, so the note the
  // caret sits in is outside and clicking it dismisses the popup.
  await click(note);
  await expect.poll(q.dialog.maybe.lazy("Formatting")).not.toBeInTheDocument();
});

// https://github.com/ariakit/ariakit/issues/7087
test("returns focus to the named button when dismissed from inside", async () => {
  await openFromQuickFormatAndClose();

  const note = q.textbox("Note");
  await click(note);
  await press("*", note);
  expect(q.dialog("Formatting")).toBeVisible();

  await click(q.button("Done"));
  await expect.poll(q.dialog.maybe.lazy("Formatting")).not.toBeInTheDocument();
  expect(q.button("Formatting")).toHaveFocus();
});

// The named button holds the store, but the popup still marks the caret's field
// as outside itself, so Escape from there dismisses it. This is the one
// consequence computed from the store when the popup opens rather than read
// live, which is why the issue measured a deferred assignment losing it.
// https://github.com/ariakit/ariakit/issues/7087
test("dismisses with Escape from the field the caret is in", async () => {
  await openFromQuickFormatAndClose();

  const note = q.textbox("Note");
  await click(note);
  await press("*", note);
  expect(q.dialog("Formatting")).toBeVisible();

  await press.Escape(note);
  await expect.poll(q.dialog.maybe.lazy("Formatting")).not.toBeInTheDocument();
});

// A mounted button already claims the store, and the store can't tell that
// apart from the application assigning the same button. So a show() that names
// nothing keeps the button rather than the element that happened to be focused,
// which also anchors the popup to that button and returns focus there on close.
// https://github.com/ariakit/ariakit/issues/7087
test("keeps a mounted button as the opener when the open names none", async () => {
  await openFromQuickFormatAndClose();

  await click(q.button("Suggest formatting"));
  expect(q.dialog("Formatting")).toBeVisible();
  expect(q.button("Quick format")).toHaveAttribute("aria-expanded", "true");
  expect(q.button("Formatting")).toHaveAttribute("aria-expanded", "false");
});

// An open with nothing focused captures nothing, so the field captured by an
// earlier open stays in the store without having been named. The next open must
// still treat it as a stale fallback rather than as somebody's choice.
// https://github.com/ariakit/ariakit/issues/7087
test("replaces the fallback after an open that captured nothing", async () => {
  const note = q.textbox("Note");
  const title = q.textbox("Title");
  await click(note);
  await press("/", note);
  expect(q.dialog("Suggestions")).toBeVisible();
  await press.Escape(note);
  await expect.poll(q.dialog.maybe.lazy("Suggestions")).not.toBeInTheDocument();

  await click(q.button("Summarize note"));
  expect(q.dialog("Suggestions")).toBeVisible();
  // The button dropped focus, so this Escape comes from the body.
  await press.Escape();
  await expect.poll(q.dialog.maybe.lazy("Suggestions")).not.toBeInTheDocument();

  await click(title);
  await press("/", title);
  expect(q.dialog("Suggestions")).toBeVisible();
  await click(title);
  // Nothing observable marks the dismissal that must not happen, so cross that
  // window before asserting the title is the opener rather than the note.
  await sleep();
  expect(q.dialog("Suggestions")).toBeVisible();
});

// The popup's own store is derived and gets replaced when its wrapper remounts,
// while the editor's store carries the opener across. Whatever tracks that the
// field was only a fallback has to survive that too, or the field stays the
// opener forever.
// https://github.com/ariakit/ariakit/issues/7087
test("replaces the fallback after the popup's own store is replaced", async () => {
  const note = q.textbox("Note");
  const title = q.textbox("Title");
  await click(note);
  await press("/", note);
  expect(q.dialog("Suggestions")).toBeVisible();
  await press.Escape(note);
  await expect.poll(q.dialog.maybe.lazy("Suggestions")).not.toBeInTheDocument();

  await click(q.button("Reload suggestions"));

  await click(title);
  await press("/", title);
  expect(q.dialog("Suggestions")).toBeVisible();
  await click(title);
  // Nothing observable marks the dismissal that must not happen, so cross that
  // window before asserting the title is the opener rather than the note.
  await sleep();
  expect(q.dialog("Suggestions")).toBeVisible();
});

test("falls back to the focused field when no button is mounted", async () => {
  const note = q.textbox("Note");
  const title = q.textbox("Title");
  await click(note);
  await press("/", note);
  expect(q.dialog("Suggestions")).toBeVisible();

  // The note opened the popup, so clicking it is not an outside interaction.
  await click(note);
  // Nothing observable marks the moment an outside interaction would have
  // dismissed the popup, so cross that window before asserting it stayed open.
  await sleep();
  expect(q.dialog("Suggestions")).toBeVisible();

  await click(title);
  await expect.poll(q.dialog.maybe.lazy("Suggestions")).not.toBeInTheDocument();

  // Reopening from the title hands the popup a new opener, so now it's the
  // title that no longer counts as outside. A fix that simply kept any opener
  // it found would leave the note in place and dismiss the popup here.
  await press("/", title);
  expect(q.dialog("Suggestions")).toBeVisible();
  await click(title);
  // Same as above: nothing observable marks the dismissal that must not happen.
  await sleep();
  expect(q.dialog("Suggestions")).toBeVisible();
});
