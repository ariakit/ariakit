import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ query, test }) => {
  test("renders links in a navigation landmark and marks the current one", async ({
    q,
  }) => {
    const nav = query(q.navigation("Feed"));
    await test
      .expect(nav.link("For you"))
      .toHaveAttribute("aria-current", "page");
    await nav.link("Following").click();
    await test
      .expect(nav.link("Following"))
      .toHaveAttribute("aria-current", "page");
    await test.expect(nav.link("For you")).not.toHaveAttribute("aria-current");
  });
});
