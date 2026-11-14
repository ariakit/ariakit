import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ query, test }) => {
  test("names the group, its avatars, and the count", async ({ q }) => {
    const group = query(q.group("Project members"));
    await test.expect(group.img()).toHaveCount(5);
    await test.expect(group.img("Hana Kobayashi")).toHaveText("HK");
    await test.expect(group.img("3 more members")).toHaveText("+3");
  });
});
