import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

const labels = ["Fruit", "Fruit without virtual focus"];

withFramework(import.meta.dirname, async ({ test, query }) => {
  for (const label of labels) {
    // https://github.com/ariakit/ariakit/issues/7093
    test(`${label}: a collapsed select never focuses its list`, async ({
      page,
      q,
    }) => {
      const select = q.combobox(label);
      const list = q.listbox(`${label} options`);
      const focusedOptions = q.status(`${label} focused options`);

      await select.focus();

      await test.expect(select).toHaveAttribute("aria-expanded", "false");
      // The composite can present its active item from a queued microtask or
      // from a passive effect that runs after paint, so cross those frames
      // before asserting that focus never reached the list.
      await flushFrames(page);
      await test.expect(select).toBeFocused();
      await test.expect(focusedOptions).toHaveText("none");

      await select.press("g");

      await test.expect(select).toHaveText("Grape");
      await test
        .expect(query(list).option("Grape"))
        .toHaveAttribute("data-active-item");
      // The move is committed by the assertions above, but the presentation
      // effect it schedules still runs after paint.
      await flushFrames(page);
      await test.expect(select).toBeFocused();
      await test.expect(select).toHaveAttribute("aria-expanded", "false");
      await test.expect(focusedOptions).toHaveText("none");

      // Opening the list is what turns its items into focus targets, so this
      // also shows that the recorder fires when an item really is focused.
      await select.press("ArrowDown");

      await test.expect(select).toHaveAttribute("aria-expanded", "true");
      await test
        .expect(query(list).option("Grape"))
        .toHaveAttribute("data-active-item");
      await test.expect(focusedOptions).toContainText("Grape");
    });
  }
});
