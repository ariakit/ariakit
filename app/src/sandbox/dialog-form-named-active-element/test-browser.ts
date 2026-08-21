import { withFramework } from "#app/test-utils/preview.ts";

// happy-dom implements no document named getter, so only a real browser makes
// the form answer the `activeElement` read. The three desktop projects all
// reproduce it.
withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/7225
  test("restores dialog focus past a named activeElement form", async ({
    q,
  }) => {
    await q.button("Edit report").click();
    await test.expect(q.status("Focused element")).toHaveText("Done");

    await q.button("Done").click();

    await test.expect(q.status("Focused element")).toHaveText("Edit report");
  });
});
