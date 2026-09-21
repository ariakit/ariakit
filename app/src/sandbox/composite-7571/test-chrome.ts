import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/7571
  test("does not replay a consumed move when the provider remounts", async ({
    page,
    q,
  }) => {
    await q.button("Focus italic").click();
    await test.expect(q.button("Italic", { exact: true })).toBeFocused();
    await q.button("Hide toolbar").click();
    await test.expect(q.toolbar("Formatting")).toHaveCount(0);
    await q.button("Show toolbar").click();
    await test.expect(q.toolbar("Formatting")).toBeVisible();
    // A stale item presentation runs in a passive effect after the remount.
    await flushFrames(page);
    await test.expect(q.button("Hide toolbar")).toBeFocused();
  });

  // https://github.com/ariakit/ariakit/issues/7571
  test("does not replay a cancelled move after its target returns", async ({
    page,
    q,
  }) => {
    await q.button("Hide toolbar").click();
    await q.button("Focus italic").click();
    await q.button("Select bold").click();
    await q.button("Select italic").click();
    await q.button("Show toolbar").click();
    await test.expect(q.toolbar("Formatting")).toBeVisible();
    // Cancellation has no positive focus state; cross the presentation effect.
    await flushFrames(page);
    await test.expect(q.button("Hide toolbar")).toBeFocused();
  });

  for (const target of ["italic", "toolbar"]) {
    test(`preserves a pending move to the ${target} while the provider is absent`, async ({
      q,
    }) => {
      await q.button("Hide toolbar").click();
      await test.expect(q.toolbar("Formatting")).toHaveCount(0);
      await q.button(`Focus ${target}`).click();
      await q.button("Show toolbar").click();
      const element =
        target === "toolbar"
          ? q.toolbar("Formatting")
          : q.button("Italic", { exact: true });
      await test.expect(element).toBeFocused();
    });
  }

  test("keeps requests separate when the source store changes", async ({
    page,
    q,
  }) => {
    await q.button("Focus italic").click();
    await test.expect(q.button("Italic", { exact: true })).toBeFocused();
    await q.button("Focus bold in second document").click();
    await q.button("Use second document").click();
    await test.expect(q.button("Bold", { exact: true })).toBeFocused();
    await q.button("Use first document").click();
    await test.expect(q.button("Use second document")).toBeVisible();
    // The provider replaces its core store in a passive update effect.
    await flushFrames(page);
    await test.expect(q.button("Use second document")).toBeFocused();
  });

  test("keeps move requests independent when only activeId is shared", async ({
    q,
  }) => {
    await q.button("Focus first palette").click();
    await test.expect(q.toolbar("First palette")).toBeFocused();
    await q.button("Focus second palette").click();
    await test.expect(q.toolbar("Second palette")).toBeFocused();
  });

  // https://github.com/ariakit/ariakit/pull/7572#discussion_r4067003752
  test("preserves item focus when only moves are shared", async ({ q }) => {
    await q.button("Focus green").click();
    await test.expect(q.button("Green", { exact: true })).toBeFocused();
    await test.expect(q.text("Moves: 1")).toBeVisible();
  });
});
