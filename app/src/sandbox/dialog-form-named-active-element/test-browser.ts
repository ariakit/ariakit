import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

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

  // https://github.com/ariakit/ariakit/issues/7230
  test("keeps escaped focus past a named activeElement form", async ({
    page,
    q,
  }) => {
    const focusHistory = q.status("Filter focus history");
    await test.expect(focusHistory).toHaveText("none");

    await q.button("Filter reports").click();

    await test.expect(focusHistory).toHaveText("query → help");
    // The escape must not have closed the dialog, or the queued auto-focus
    // would bail out on the closed store and pass without deciding anything.
    await test.expect(q.dialog("Filter reports")).toBeVisible();
    // The dialog queues its own auto-focus after the element mounts, and there
    // is no positive state for focus not being pulled back once that microtask
    // has run.
    await flushFrames(page);
    await test.expect(focusHistory).toHaveText("query → help");
  });
});
