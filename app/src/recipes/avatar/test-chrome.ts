import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ query, test }) => {
  test("hides the avatars and keeps the names", async ({ q }) => {
    const list = query(q.list("Team"));
    await test.expect(list.listitem()).toHaveCount(3);
    await test.expect(list.text("Hana Kobayashi")).toBeVisible();
    await test.expect(list.text("HK")).toHaveAttribute("aria-hidden", "true");
    await test.expect(list.img()).toHaveCount(0);
  });
});
