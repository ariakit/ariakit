import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3972223511
  test("keeps a dialog closed when its navigation contains the current page", async ({
    q,
  }) => {
    const disclosure = q.button("Open navigation dialog");
    await test.expect(disclosure).toHaveAttribute("aria-expanded", "false");
    await test.expect(q.dialog("Navigation dialog")).toBeHidden();

    await disclosure.click();
    await test.expect(q.dialog("Navigation dialog")).toBeVisible();
    await test
      .expect(q.link("Documentation"))
      .toHaveAttribute("aria-current", "page");

    await q.button("Close navigation dialog").click();
    await test.expect(q.dialog("Navigation dialog")).toBeHidden();
  });

  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3972223511
  test("opens the current page's navigation group across an unrelated provider", async ({
    q,
  }) => {
    await test
      .expect(q.button("Account pages"))
      .toHaveAttribute("aria-expanded", "true");
    await test.expect(q.link("Account overview")).toBeVisible();
    await test
      .expect(q.button("Open account settings"))
      .toHaveAttribute("aria-expanded", "false");
    await test.expect(q.dialog("Account settings")).toBeHidden();

    await q.button("Open account settings").click();
    await test.expect(q.dialog("Account settings")).toBeVisible();
  });
});
