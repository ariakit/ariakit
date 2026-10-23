import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  test("names and describes the fields with slots", async ({ q }) => {
    await test
      .expect(q.textbox("Amount"))
      .toHaveAccessibleDescription("Up to 10,000 per transfer.");
    await test.expect(q.combobox("Currency")).toHaveText("USD");
    await test
      .expect(q.textbox("Domain"))
      .toHaveAccessibleDescription("Verified.");
  });

  test("focuses the amount from a click on the symbol", async ({ q }) => {
    const amount = q.textbox("Amount");
    await query(amount.locator("..")).text("$").click();
    await test.expect(amount).toBeFocused();
  });

  test("shows the symbol of the chosen currency", async ({ q }) => {
    await q.combobox("Currency").click();
    await q.option("EUR").click();
    await test.expect(q.combobox("Currency")).toHaveText("EUR");
    await test
      .expect(query(q.textbox("Amount").locator("..")).text("€"))
      .toBeVisible();
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

  test("shows the initials of the display name", async ({ q }) => {
    await test.expect(q.text("AL")).toBeVisible();
    await q.textbox("Display name").fill("Grace Hopper");
    await test.expect(q.text("GH")).toBeVisible();
  });
});
