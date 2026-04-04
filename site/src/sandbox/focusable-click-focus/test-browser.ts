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

  test("checkbox receives focus on label click", async ({ q }) => {
    const checkbox = q.checkbox("Checkbox");
    await q.text("Checkbox").click();
    await test.expect(checkbox).toBeFocused();
  });

  test("radio receives focus on label click", async ({ q }) => {
    const radio = q.radio("Radio A");
    await q.text("Radio A").click();
    await test.expect(radio).toBeFocused();
  });

  test("submit input receives focus on click", async ({ q }) => {
    const submit = q.button("Submit");
    await submit.click();
    await test.expect(submit).toBeFocused();
  });

  test("wrapped checkbox receives focus on click", async ({ q }) => {
    const checkbox = q.checkbox("Wrapped");
    await checkbox.click();
    await test.expect(checkbox).toBeFocused();
  });

  test("wrapped checkbox receives focus on label click", async ({ q }) => {
    const checkbox = q.checkbox("Wrapped");
    await q.text("Wrapped").click();
    await test.expect(checkbox).toBeFocused();
  });
});
