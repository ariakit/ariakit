import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("button receives focus on click", async ({ q }) => {
    const button = q.button("Button");
    await button.click();
    await test.expect(button).toBeFocused();
  });

  test("checkbox receives focus on click", async ({ q }) => {
    const checkbox = q.checkbox("Checkbox");
    await checkbox.click();
    await test.expect(checkbox).toBeFocused();
  });

  test("radio receives focus on click", async ({ q }) => {
    const radio = q.radio("Radio A");
    await radio.click();
    await test.expect(radio).toBeFocused();
  });

  test("checkbox receives focus on label click", async ({ page, q }) => {
    const checkbox = q.checkbox("Checkbox");
    await page.getByText("Checkbox").click();
    await test.expect(checkbox).toBeFocused();
  });

  test("radio receives focus on label click", async ({ page, q }) => {
    const radio = q.radio("Radio A");
    await page.getByText("Radio A").click();
    await test.expect(radio).toBeFocused();
  });
});
