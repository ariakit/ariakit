import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("updates virtual focus state after hover and keyboard events", async ({
    page,
    q,
  }) => {
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");

    await q.button("item-3").hover();
    await test
      .expect(q.list("Event log"))
      .toContainText(
        "event: mouseenter | currentTarget: item-3 | target: item-3",
      );

    await q.button("item-3").click();
    await page.keyboard.press("ArrowLeft");
    await test
      .expect(q.button("item-3"))
      .not.toHaveAttribute("data-active-item");
    await test.expect(q.button("item-2")).toHaveAttribute("data-focus-visible");
    await test.expect(q.button("item-2")).toHaveAttribute("data-active-item");

    await q.button("item-1").hover();
    await test
      .expect(q.list("Event log"))
      .toContainText(
        "event: mouseenter | currentTarget: item-1 | target: item-1",
      );

    await q.button("item-1").click();
    await test.expect(q.toolbar()).not.toHaveAttribute("data-focus-visible");
    await test
      .expect(q.button("item-1"))
      .not.toHaveAttribute("data-focus-visible");
    await test.expect(q.button("item-1")).toHaveAttribute("data-active-item");
    await test
      .expect(q.button("item-2"))
      .not.toHaveAttribute("data-focus-visible");
    await test
      .expect(q.button("item-2"))
      .not.toHaveAttribute("data-active-item");
  });
});
