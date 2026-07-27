import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  test("dispatches virtual focus events in order", async ({ page, q }) => {
    const events = query(q.list("Event log")).listitem();
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await test.expect(events).toHaveCount(10);
    await test
      .expect(events)
      .toHaveText([
        "event: focus | currentTarget: toolbar | target: toolbar",
        "event: focus | currentTarget: item-1 | target: item-1 | relatedTarget: toolbar",
        "event: focus | currentTarget: toolbar | target: item-1 | relatedTarget: toolbar",
        "event: keyup | currentTarget: item-1 | target: item-1",
        "event: keyup | currentTarget: toolbar | target: item-1",
        "event: keydown | currentTarget: item-1 | target: item-1",
        "event: keydown | currentTarget: toolbar | target: item-1",
        "event: blur | currentTarget: item-1 | target: item-1",
        "event: blur | currentTarget: toolbar | target: item-1",
        "event: blur | currentTarget: toolbar | target: toolbar",
      ]);

    await q.button("item-3").click();
    await test.expect(events).toHaveCount(13);
    await test
      .expect(events)
      .toHaveText([
        /event: focus/,
        /event: focus/,
        /event: focus/,
        /event: keyup/,
        /event: keyup/,
        /event: keydown/,
        /event: keydown/,
        /event: blur/,
        /event: blur/,
        /event: blur/,
        "event: focus | currentTarget: item-3 | target: item-3",
        "event: focus | currentTarget: toolbar | target: toolbar | relatedTarget: item-3",
        "event: focus | currentTarget: toolbar | target: item-3",
      ]);

    await q.button("item-2").click();
    await test.expect(events).toHaveCount(17);
    await test
      .expect(events)
      .toHaveText([
        /event: focus/,
        /event: focus/,
        /event: focus/,
        /event: keyup/,
        /event: keyup/,
        /event: keydown/,
        /event: keydown/,
        /event: blur/,
        /event: blur/,
        /event: blur/,
        /event: focus/,
        /event: focus/,
        /event: focus/,
        "event: blur | currentTarget: item-3 | target: item-3 | relatedTarget: item-2",
        "event: blur | currentTarget: toolbar | target: item-3 | relatedTarget: item-2",
        "event: focus | currentTarget: item-2 | target: item-2 | relatedTarget: toolbar",
        "event: focus | currentTarget: toolbar | target: item-2 | relatedTarget: toolbar",
      ]);
  });
});
