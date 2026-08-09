import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/3833
  // Without name attributes, the browser treats all radio inputs as one group.
  // This affects native browser behaviors like Tab navigation and form submission.
  test("radios have unique name attributes per group", async ({ q }) => {
    const fruitsGroup = q.radiogroup("Fruits");
    const vegetablesGroup = q.radiogroup("Vegetables");

    const fruitsNames = await fruitsGroup
      .getByRole("radio")
      .evaluateAll((els) => els.map((el) => (el as HTMLInputElement).name));
    const vegetablesNames = await vegetablesGroup
      .getByRole("radio")
      .evaluateAll((els) => els.map((el) => (el as HTMLInputElement).name));

    const fruitsName = fruitsNames[0];
    const vegetablesName = vegetablesNames[0];

    test.expect(fruitsName).toBeTruthy();
    test.expect(vegetablesName).toBeTruthy();
    test.expect(fruitsNames.every((n) => n === fruitsName)).toBe(true);
    test.expect(vegetablesNames.every((n) => n === vegetablesName)).toBe(true);

    test.expect(fruitsName).not.toBe(vegetablesName);
  });

  test("Tab moves focus between groups", async ({ page, q }) => {
    // Check a radio so the group has a selection — Tab behavior differs when
    // a radio is checked vs. when none is checked.
    await q.radio("Apple").click();
    await test.expect(q.radio("Apple")).toBeChecked();

    await page.keyboard.press("Tab");
    await test.expect(q.radio("Potato")).toBeFocused();

    await page.keyboard.press("Shift+Tab");
    await test.expect(q.radio("Apple")).toBeFocused();
  });

  test("form submission serializes values per group", async ({ page, q }) => {
    let alertMessage = "";
    page.on("dialog", async (dialog) => {
      alertMessage = dialog.message();
      await dialog.accept();
    });

    await q.radio("Orange").click();
    await q.radio("Carrot").click();
    await q.button("Submit").click();

    await test.expect(() => test.expect(alertMessage).toBeTruthy()).toPass();

    const data = JSON.parse(alertMessage);

    const keys = Object.keys(data);
    test.expect(keys.length).toBe(2);

    test.expect(Object.values(data)).toContain("orange");
    test.expect(Object.values(data)).toContain("carrot");
  });
});
