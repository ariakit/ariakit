import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3972224343
  test("keeps popover spacing with optional position props", async ({ q }) => {
    const input = q.combobox("Assignee");
    await input.click();
    const inputBox = await input.boundingBox();
    test.expect(inputBox).not.toBeNull();
    if (!inputBox) return;
    await test.expect
      .poll(async () => {
        const box = await q.listbox().boundingBox();
        return box && Math.round(box.y - inputBox.y - inputBox.height);
      })
      .toBe(8);
    await test
      .expect(query(q.region("Project editor")).listbox())
      .toHaveCount(0);
    await input.press("Escape");
    const select = q.combobox("Status");
    await select.click();
    const selectBox = await select.boundingBox();
    test.expect(selectBox).not.toBeNull();
    if (!selectBox) return;
    await test.expect
      .poll(async () => {
        const box = await q.listbox("Status").boundingBox();
        return box && Math.round(box.y - selectBox.y - selectBox.height);
      })
      .toBe(8);
    await test.expect
      .poll(async () => {
        const box = await q.listbox("Status").boundingBox();
        return box && Math.round(box.x - selectBox.x);
      })
      .toBe(-3);
  });
});
