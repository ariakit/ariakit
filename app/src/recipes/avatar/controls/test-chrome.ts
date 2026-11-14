import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ query, test }) => {
  test("keeps the avatars out of the names of the controls", async ({ q }) => {
    await test.expect(q.button("Acme")).toBeVisible();
    await test.expect(q.button("Account")).toBeVisible();
    const nav = query(q.navigation("Direct messages"));
    await test
      .expect(nav.link("Hana Kobayashi"))
      .toHaveAccessibleDescription("hana@example.com");
    await test.expect(nav.link("Tom Becker")).toBeVisible();
    await test.expect(nav.text("HK")).toHaveAttribute("aria-hidden", "true");
  });
});
