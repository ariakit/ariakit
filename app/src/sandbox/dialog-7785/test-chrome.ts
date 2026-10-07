import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/7785
  test("moves focus to the dialog that React replaced around the opener", async ({
    page,
    q,
  }) => {
    await q.button("Edit order").click();
    await q.button("Payment").click();
    await test.expect(q.dialog("Payment")).toBeVisible();

    // The order editor changes its element, so React replaces the "Payment"
    // button that opened the payment dialog.
    await q.button("Mark as paid").click();
    await test.expect(q.text("Status: paid")).toBeVisible();

    await page.keyboard.press("Escape");
    await test.expect(q.dialog("Payment")).not.toBeVisible();
    // The order editor is still open, so focus goes to it and not to the "Edit
    // order" button outside it.
    await test.expect(q.dialog("Order")).toBeFocused();
  });
});
