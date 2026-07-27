import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/pull/6832
  test("opens the dialog without highlighting an option", async ({
    page,
    q,
  }) => {
    await q.button("Move to folder").click();
    await test.expect(q.listbox("Folders")).toBeVisible();
    // The retrying assertion comes first. The negative ones below pass as soon
    // as the attribute is missing and never re-check, so on their own they
    // would let a late active item slip through.
    await test.expect(q.text("Highlighted: none")).toBeVisible();
    await test
      .expect(q.listbox("Folders"))
      .not.toHaveAttribute("aria-activedescendant");
    await test
      .expect(q.option("Inbox"))
      .not.toHaveAttribute("data-active-item");

    await page.keyboard.press("ArrowDown");
    await test.expect(q.option("Inbox")).toHaveAttribute("data-active-item");
    await test.expect(q.text("Highlighted: Inbox")).toBeVisible();
  });
});
