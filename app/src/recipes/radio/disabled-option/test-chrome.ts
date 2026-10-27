import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ query, test }) => {
  test("tells why a card is disabled and skips it with the arrow keys", async ({
    page,
    q,
  }) => {
    const group = query(q.radiogroup("Shipping method"));
    const sameDay = group.radio("Same day $25");
    await test.expect(sameDay).toBeDisabled();
    await test
      .expect(sameDay)
      .toHaveAccessibleDescription("Not available for 94107");
    await group.text("Standard").click();
    await test.expect(group.radio("Standard Free")).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await test.expect(group.radio("Express $12")).toBeChecked();
    await page.keyboard.press("ArrowDown");
    await test.expect(group.radio("Standard Free")).toBeChecked();
    await test.expect(group.radio("Standard Free")).toBeFocused();
  });

  test("keeps the Arabic version in its own group", async ({ q }) => {
    const english = query(q.radiogroup("Shipping method"));
    const arabic = query(q.radiogroup("طريقة الشحن"));
    await test.expect(arabic.radio("عادي مجاني")).toBeChecked();
    await test
      .expect(arabic.radio("في اليوم نفسه 25 $"))
      .toHaveAccessibleDescription("غير متاح للرمز البريدي 94107");
    await arabic.text("سريع").click();
    await test.expect(arabic.radio("سريع 12 $")).toBeChecked();
    await test.expect(english.radio("Standard Free")).toBeChecked();
  });
});
