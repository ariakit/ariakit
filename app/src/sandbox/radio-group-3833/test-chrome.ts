import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/3833
  // Without name attributes, the browser treats all radio inputs as one group.
  // This affects native browser behaviors like Tab navigation and form
  // submission.
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
});
