import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  test("moves the current page to the clicked link", async ({ q }) => {
    const nav = query(q.navigation("Main"));
    await test.expect(nav.link("Home")).toHaveAttribute("aria-current", "page");
    await nav.link("Inbox").click();
    await test
      .expect(nav.link("Inbox"))
      .toHaveAttribute("aria-current", "page");
    await test.expect(nav.link("Home")).not.toHaveAttribute("aria-current");
  });

  test("describes a link by the count on its icon", async ({ q }) => {
    const nav = query(q.navigation("Main"));
    await test
      .expect(nav.link("Inbox"))
      .toHaveAccessibleDescription("3 unread");
  });
});
