import { click, dispatch, focus, hover, press, q, sleep } from "@ariakit/test";
import { expect, test } from "vitest";

const hovercard = () => q.dialog("Ariakit profile");
const maybeHovercard = () => q.dialog.maybe("Ariakit profile");

const hoverOutside = async () => {
  await hover(document.body);
  await hover(document.body, { clientX: 10, clientY: 10 });
};

// https://github.com/ariakit/ariakit/issues/7043
test("shows after hovering and hides after hovering outside", async () => {
  expect(maybeHovercard()).not.toBeInTheDocument();

  // Dispatch directly so the assertions run before the timeout can expire when
  // the full suite delays the interaction helper.
  await dispatch.mouseMove(q.link("@ariakit.com"));
  expect(maybeHovercard()).not.toBeInTheDocument();
  await expect.poll(hovercard).toBeVisible();

  await dispatch.mouseMove(document.body);
  expect(hovercard()).toBeVisible();
  await expect.poll(maybeHovercard).not.toBeInTheDocument();
});

test("stays open while focused", async () => {
  await hover(q.link("@ariakit.com"));
  await expect.poll(hovercard).toBeVisible();
  await click(q.button("Follow"));

  await hoverOutside();
  await sleep(300);
  expect(hovercard()).toBeVisible();
});

// https://github.com/ariakit/ariakit/issues/8490
test("stays open when focus moves into it while a hide is pending", async () => {
  const anchor = q.link("@ariakit.com");
  await press.Tab();
  expect(anchor).toHaveFocus();
  await hover(anchor);
  await expect.poll(hovercard).toBeVisible();

  // The mouse moves away from the anchor, which schedules a hide.
  await hoverOutside();
  await press.Tab();
  expect(q.button("Follow")).toHaveFocus();
  // The pending hide would run after the 200ms hide timeout, and no state shows
  // that the timeout passed without it.
  await sleep(300);
  expect(hovercard()).toBeVisible();
  expect(q.button("Follow")).toHaveFocus();
});

// https://github.com/ariakit/ariakit/issues/8490
test("stays open when focus moves into a nested hovercard while a hide is pending", async () => {
  const anchor = q.link("Ariakit team");
  const hovercard = () => q.dialog("Team members");
  const nestedHovercard = () => q.dialog("Member profile");
  await focus(anchor);
  await hover(anchor);
  await expect.poll(hovercard).toBeVisible();
  await hover(q.link("@diegohaz"));
  await expect.poll(nestedHovercard).toBeVisible();

  // The mouse moves away from both hovercards, which schedules their hides.
  await hoverOutside();
  await press.Tab();
  expect(q.link("@diegohaz")).toHaveFocus();
  await press.Tab();
  expect(q.button("Message")).toHaveFocus();
  // The pending hides would run after the 200ms hide timeout, and no state
  // shows that the timeout passed without them.
  await sleep(300);
  expect(hovercard()).toBeVisible();
  expect(nestedHovercard()).toBeVisible();
  expect(q.button("Message")).toHaveFocus();
});

test("stays open when the pointer quickly returns", async () => {
  const anchor = q.link("@ariakit.com");
  await hover(anchor);
  await expect.poll(hovercard).toBeVisible();

  await hoverOutside();
  await sleep(100);
  await hover(anchor);
  await sleep(300);
  expect(hovercard()).toBeVisible();

  await hoverOutside();
  await sleep(100);
  await hover(q.button("Follow"));
  await sleep(300);
  expect(hovercard()).toBeVisible();
});

test("Escape closes an unfocused hovercard without moving focus", async () => {
  const anchor = q.link("@ariakit.com");
  await hover(anchor);
  await expect.poll(hovercard).toBeVisible();

  await press.Escape();
  expect(maybeHovercard()).not.toBeInTheDocument();
  expect(anchor).not.toHaveFocus();
});

test("Escape closes a focused hovercard and restores the anchor", async () => {
  const anchor = q.link("@ariakit.com");
  await hover(anchor);
  await expect.poll(hovercard).toBeVisible();
  await click(q.button("Follow"));

  await press.Escape();
  expect(maybeHovercard()).not.toBeInTheDocument();
  expect(anchor).toHaveFocus();
});

test("Escape keeps the hovercard closed while the pointer rests on the anchor", async () => {
  const anchor = q.link("@ariakit.com");
  await hover(anchor);
  await expect.poll(hovercard).toBeVisible();

  await press.Escape();
  expect(maybeHovercard()).not.toBeInTheDocument();
  await hover(anchor);
  // The hovercard would show after its 20ms show timeout, and no state shows
  // that the timeout passed without it.
  await sleep(50);
  expect(maybeHovercard()).not.toBeInTheDocument();

  await hoverOutside();
  await hover(anchor);
  await expect.poll(hovercard).toBeVisible();
});

test("keeps the hovercard open when its anchor is clicked", async () => {
  const anchor = q.link("@ariakit.com");
  await hover(anchor);
  await expect.poll(hovercard).toBeVisible();

  await click(anchor);
  expect(hovercard()).toBeVisible();
});

test("hideOnClick hides the hovercard until the pointer leaves the anchor", async () => {
  const docsPreview = () => q.dialog("Docs preview");
  const maybeDocsPreview = () => q.dialog.maybe("Docs preview");
  const anchor = q.link("Ariakit docs");
  await hover(anchor);
  await expect.poll(docsPreview).toBeVisible();

  await click(anchor);
  expect(maybeDocsPreview()).not.toBeInTheDocument();
  await hover(anchor);
  // The hovercard would show after its 20ms show timeout, and no state shows
  // that the timeout passed without it.
  await sleep(50);
  expect(maybeDocsPreview()).not.toBeInTheDocument();

  await hoverOutside();
  await hover(anchor);
  await expect.poll(docsPreview).toBeVisible();
});

test("hideOnClick blocks the hovercard after a click with no mouse move before it", async () => {
  // A page that hydrates under a resting mouse gets the click before any mouse
  // move over the anchor.
  const anchor = q.link("Ariakit docs");
  await dispatch.click(anchor, { detail: 1 });
  await dispatch.mouseMove(anchor);
  // The hovercard would show after its 20ms show timeout, and no state shows
  // that the timeout passed without it.
  await sleep(50);
  expect(q.dialog.maybe("Docs preview")).not.toBeInTheDocument();
});

test("hideOnClick shows the hovercard again after the mouse leaves the anchor without a move", async () => {
  const anchor = q.link("Ariakit docs");
  await hover(anchor);
  await expect.poll(q.dialog.lazy("Docs preview")).toBeVisible();
  await click(anchor);
  expect(q.dialog.maybe("Docs preview")).not.toBeInTheDocument();
  // The mouse leaves straight to a parent frame or out of the window, so no
  // mouse move reaches this document before it comes back.
  await dispatch.mouseLeave(anchor);
  await dispatch.mouseMove(anchor);
  await expect.poll(q.dialog.lazy("Docs preview")).toBeVisible();
});
