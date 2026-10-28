import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  test("focuses the amount from a click on the symbol", async ({ q }) => {
    const amount = q.textbox("Amount");
    await query(amount.locator("..")).text("$").click();
    await test.expect(amount).toBeFocused();
  });

  test("mirrors the slots in the right-to-left amount", async ({ q }) => {
    const amount = q.textbox("المبلغ");
    const [symbol, field, select] = await Promise.all([
      query(amount.locator("..")).text("$").boundingBox(),
      amount.boundingBox(),
      q.combobox("العملة").boundingBox(),
    ]);
    test.expect(symbol).not.toBeNull();
    test.expect(field).not.toBeNull();
    test.expect(select).not.toBeNull();
    if (!symbol || !field || !select) return;
    test.expect(symbol.x).toBeGreaterThanOrEqual(field.x + field.width);
    test.expect(select.x + select.width).toBeLessThanOrEqual(field.x);
  });
});
