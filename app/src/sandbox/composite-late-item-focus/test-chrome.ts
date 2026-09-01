import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/7378
  test("does not redirect a derived composite move before the first mount", async ({
    page,
    q,
  }) => {
    await q.button("Queue initial tab list").click();
    await q.button("Show initially hidden tab list").click();

    // The tab registers in a passive effect, and no state exposes when a stale
    // pending presentation would move focus afterward.
    await flushFrames(page);
    await test.expect(q.button("Show initially hidden tab list")).toBeFocused();
    await test.expect(q.tab("Initial tab")).not.toBeFocused();
  });
});
