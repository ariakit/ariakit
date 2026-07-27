import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("updates integer-like and ordinary checkbox names", async ({ q }) => {
    const integerName = q.checkbox("123");
    const ordinaryName = q.checkbox("safe");

    await test.expect(integerName).toBeChecked();
    await integerName.click();
    await test.expect(integerName).not.toBeChecked();

    await test.expect(ordinaryName).toBeChecked();
    await ordinaryName.click();
    await test.expect(ordinaryName).not.toBeChecked();
  });
});
