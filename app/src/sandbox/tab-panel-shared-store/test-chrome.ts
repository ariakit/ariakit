import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  for (const name of ["Project", "Team"]) {
    // https://github.com/ariakit/ariakit/pull/5240#discussion_r3973781700
    test(`keeps the ${name.toLowerCase()} panel visible with an explicit store`, async ({
      q,
    }) => {
      await test.expect(q.tabpanel(`${name} activity`)).toBeVisible();
      await q.tab(`${name} reviews`).click();
      await test.expect(q.tabpanel(`${name} reviews`)).toBeVisible();
      await test.expect(q.text(`${name} review updates`)).toBeVisible();
      await q.tab(`${name} activity`).click();
      await test.expect(q.tabpanel(`${name} activity`)).toBeVisible();
      await test.expect(q.text(`${name} activity updates`)).toBeVisible();
    });
  }

  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3973781700
  test("preserves an explicit tabId on a single panel", async ({ q }) => {
    await test.expect(q.tabpanel("Pinned activity")).toBeVisible();
    await q.tab("Pinned reviews").click();
    await test
      .expect(q.tab("Pinned reviews"))
      .toHaveAttribute("aria-selected", "true");
    await test.expect(q.tabpanel("Pinned activity")).not.toBeVisible();
    await q.tab("Pinned activity").click();
    await test.expect(q.tabpanel("Pinned activity")).toBeVisible();
  });
});
