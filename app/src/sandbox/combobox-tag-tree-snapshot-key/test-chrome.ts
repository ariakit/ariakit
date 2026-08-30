import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  // The combobox popover sets its own tree snapshot key so it reads the element
  // tree again when tags render. A caller's key used to replace that one, so a
  // tag list that mounted while the popup was open stayed out of the tree the
  // popup captured, and the popup read the new tag as a nested popup of its own
  // instead of an element outside it.
  // https://github.com/ariakit/ariakit/issues/7330
  test("popup's own tree snapshot key survives the caller's key", async ({
    q,
  }) => {
    const input = q.combobox("Invitees");

    await input.click();
    await input.press("ArrowDown");
    await test.expect(q.listbox("Suggestions")).toBeVisible();
    await test.expect(q.listbox("Invitees")).toHaveCount(0);

    await q.option("Grace Hopper").click();

    await test.expect(q.listbox("Suggestions")).toBeVisible();
    const tag = query(q.listbox("Invitees")).option("Grace Hopper");
    await test.expect(tag).toBeVisible();

    await tag.click();

    await test.expect(q.listbox("Suggestions")).toBeHidden();
  });

  // The caller's key has to keep working alongside the popup's own key, the
  // same way the menu carries a caller's key alongside the one it sets for its
  // disclosure.
  // https://github.com/ariakit/ariakit/pull/7303#discussion_r3887846878
  test("caller's tree snapshot key still refreshes the tree", async ({ q }) => {
    const input = q.combobox("Invitees");
    const copyButton = q.button("Copy invite link");

    await input.click();
    await input.press("ArrowDown");
    await test.expect(q.listbox("Suggestions")).toBeVisible();
    await test.expect(copyButton).toHaveCount(0);

    await q.option("Invite by link").click();

    await test.expect(q.listbox("Suggestions")).toBeVisible();
    await test.expect(copyButton).toBeVisible();

    await copyButton.click();

    await test.expect(q.status()).toHaveText("Link copied");
    await test.expect(q.listbox("Suggestions")).toBeHidden();
  });
});
