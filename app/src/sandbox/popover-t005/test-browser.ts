import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("ignores stale async positioning after a new effect runs", async ({
    page,
    q,
  }) => {
    const wrapper = page.getByTestId("popover-wrapper");

    await q.button("Start stale update").click();
    await test.expect(q.text("Pending stale update: yes")).toBeVisible();

    await q.button("Move top").click();
    await test.expect(q.text("Pending latest update: yes")).toBeVisible();
    await test.expect(q.text("Current placement: top")).toBeVisible();
    // T005: the latest run has applied real top positioning, but is still
    // pending when the stale run below resolves.
    const topTransform = await wrapper.evaluate(
      (element) => element.style.transform,
    );
    test.expect(topTransform).not.toBe("");

    await q.button("Release stale update").click();

    await test.expect(q.text("Pending stale update: no")).toBeVisible();
    await test.expect(q.text("Pending latest update: yes")).toBeVisible();
    await test.expect(q.text("Current placement: top")).toBeVisible();
    await test.expect(q.text("Current placement: bottom")).not.toBeVisible();
    await test.expect
      .poll(() => wrapper.evaluate((element) => element.style.transform))
      .toBe(topTransform);

    await q.button("Release latest update").click();
    await test.expect(q.text("Pending latest update: no")).toBeVisible();
    await test.expect(q.text("Current placement: top")).toBeVisible();
  });
});
