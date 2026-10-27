import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ query, test }) => {
  test("names a group by its label and starts from its default value", async ({
    q,
  }) => {
    const group = query(q.radiogroup("Plan"));
    await test.expect(group.radio("Pro")).toBeChecked();
    await group.radio("Hobby").click();
    await test.expect(group.radio("Hobby")).toBeChecked();
    await test.expect(group.radio("Pro")).not.toBeChecked();
  });

  test("names a group by aria-label over its label", async ({ q }) => {
    const group = query(q.radiogroup("Color theme"));
    await test.expect(group.radio("Light")).toBeChecked();
    await test.expect(q.radiogroup("Theme")).toHaveCount(0);
  });

  test("controls a group through value and setValue", async ({ q }) => {
    const group = query(q.radiogroup("Size"));
    await test.expect(group.radio("Medium")).toBeChecked();
    await group.radio("Large").click();
    await test.expect(q.text("Selected size: l")).toBeVisible();
    await test.expect(group.radio("Large")).toBeChecked();
    await q.button("Reset size").click();
    await test.expect(group.radio("Small")).toBeChecked();
  });

  test("names a group by a fragment label", async ({ q }) => {
    const group = query(q.radiogroup("Notifications (optional)"));
    await test.expect(group.radio("Email")).toBeChecked();
  });

  test("labels a card grid synced with a store prop", async ({ q }) => {
    const grid = query(q.radiogroup("Billing"));
    await test.expect(grid.radio("Monthly")).toBeChecked();
    // The card hides its input, so click the card text.
    await grid.text("Yearly").click();
    await test.expect(q.text("Billing: yearly")).toBeVisible();
  });

  test("keeps the state of a nested group apart", async ({ q }) => {
    const shipping = query(q.radiogroup("Shipping"));
    const delivery = query(q.radiogroup("Delivery window"));
    await test.expect(shipping.radio("Express")).toBeChecked();
    await test.expect(delivery.radio("Morning")).toBeChecked();
    await delivery.radio("Evening").click();
    await test.expect(delivery.radio("Evening")).toBeChecked();
    await test.expect(shipping.radio("Express")).toBeChecked();
    await shipping.radio("Standard").click();
    await test.expect(shipping.radio("Standard")).toBeChecked();
    await test.expect(delivery.radio("Evening")).toBeChecked();
  });

  test("keeps toolbar items on the toolbar around a group", async ({
    page,
    q,
  }) => {
    await q.button("Bold").focus();
    await page.keyboard.press("ArrowRight");
    await test.expect(q.button("Italic")).toBeFocused();
    const group = query(q.radiogroup("Alignment"));
    await test.expect(group.radio("Start")).toBeChecked();
    await group.radio("Center").click();
    await page.keyboard.press("ArrowRight");
    await test.expect(group.radio("End")).toBeFocused();
    await test.expect(group.radio("End")).toBeChecked();
  });
});
