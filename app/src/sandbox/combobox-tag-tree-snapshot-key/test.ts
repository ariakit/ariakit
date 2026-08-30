import { click, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

// The combobox popover sets its own tree snapshot key so it reads the element
// tree again when tags render. A caller's key used to replace that one, so a
// tag list that mounted while the popup was open stayed out of the tree the
// popup captured, and the popup read the new tag as a nested popup of its own
// instead of an element outside it.
// https://github.com/ariakit/ariakit/issues/7330
test("popup's own tree snapshot key survives the caller's key", async () => {
  await press.Tab();
  expect(q.combobox("Invitees")).toHaveFocus();
  await press.ArrowDown();
  expect(q.listbox("Suggestions")).toBeVisible();
  expect(q.listbox.maybe("Invitees")).not.toBeInTheDocument();

  await click(q.option("Grace Hopper"));

  expect(q.listbox("Suggestions")).toBeVisible();
  const tag = q.within(q.listbox("Invitees")).option("Grace Hopper");

  await click(tag);

  expect(q.listbox.maybe("Suggestions")).not.toBeInTheDocument();
});

// The caller's key has to keep working alongside the popup's own key, the same
// way the menu carries a caller's key alongside the one it sets for its
// disclosure.
// https://github.com/ariakit/ariakit/pull/7303#discussion_r3887846878
test("caller's tree snapshot key still refreshes the tree", async () => {
  await press.Tab();
  expect(q.combobox("Invitees")).toHaveFocus();
  await press.ArrowDown();
  expect(q.listbox("Suggestions")).toBeVisible();
  expect(q.button.maybe("Copy invite link")).not.toBeInTheDocument();

  await click(q.option("Invite by link"));

  expect(q.listbox("Suggestions")).toBeVisible();
  expect(q.button.maybe("Copy invite link")).toBeInTheDocument();

  await click(q.button("Copy invite link"));

  expect(q.status()).toHaveTextContent("Link copied");
  expect(q.listbox.maybe("Suggestions")).not.toBeInTheDocument();
});
