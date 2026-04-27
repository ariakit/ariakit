import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("increment count", async ({ q }) => {
    await q.button("Count: 0").click();
    await test.expect(q.button("Count: 1")).toBeVisible();
  });
});
