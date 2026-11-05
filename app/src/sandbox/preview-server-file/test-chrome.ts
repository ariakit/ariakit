import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("renders the code that the server file highlights", async ({ q }) => {
    await test
      .expect(q.figure("counter.ts"))
      .toContainText("return count + 1;");
  });

  test("loads a lazy file from the JSON file of the build", async ({ q }) => {
    await q.button("Load counter.css").click();
    await test.expect(q.figure("counter.css")).toContainText("gap: 0.5rem;");
    await test.expect(q.button("Load counter.css")).toHaveCount(0);
  });
});
