import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("controlled store dialog calls onClose once when dismissed", async ({
    page,
    q,
  }) => {
    // See https://github.com/ariakit/ariakit/issues/3488
    await q.button("Show modal").click();
    await test.expect(q.dialog("Success")).toBeVisible();

    await q.button("OK").click();

    await test
      .expect(q.dialog("Success"))
      .toHaveAttribute("data-leave", "true");
    await page.keyboard.press("Escape");
    await test.expect(q.text("Close count: 1")).toBeVisible();

    await test
      .expect(q.dialog("Success", { includeHidden: true }))
      .toBeHidden();
    await test.expect(q.text("Close count: 1")).toBeVisible();

    await q.button("Show modal").click();
    await test.expect(q.dialog("Success")).toBeVisible();

    await page.keyboard.press("Escape");

    await test
      .expect(q.dialog("Success", { includeHidden: true }))
      .toBeHidden();
    await test.expect(q.text("Close count: 2")).toBeVisible();

    await q.button("Show modal").click();
    await test.expect(q.dialog("Success")).toBeVisible();

    await page.mouse.click(10, 10);

    await test
      .expect(q.dialog("Success", { includeHidden: true }))
      .toBeHidden();
    await test.expect(q.text("Close count: 3")).toBeVisible();

    await q.button("Show modal").click();
    await test.expect(q.dialog("Success")).toBeVisible();

    await q.button("Close with explicit store").click();

    await test
      .expect(q.dialog("Success", { includeHidden: true }))
      .toBeHidden();
    await test.expect(q.text("Close count: 4")).toBeVisible();

    await q.button("Show popover").click();
    await test.expect(q.dialog("Popover content")).toBeVisible();

    await q.button("Close popover with explicit store").click();

    await test
      .expect(q.dialog("Popover content", { includeHidden: true }))
      .toBeHidden();
    await test.expect(q.text("Popover close count: 1")).toBeVisible();
  });
});
