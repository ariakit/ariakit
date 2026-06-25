import { withFramework } from "#app/test-utils/preview.ts";

const decomposedCafe = "cafe\u0301";
const decomposedCafet = `${decomposedCafe}t`;

// https://github.com/ariakit/ariakit/issues/6315
withFramework(import.meta.dirname, async ({ test }) => {
  const expectSafeValue = async (
    value: () => Promise<string | null>,
    expectedValues: string[],
  ) => {
    await test.expect
      .poll(async () => {
        const currentValue = await value();
        return expectedValues.includes(currentValue) ? "safe" : currentValue;
      })
      .toBe("safe");
  };

  test("does not corrupt decomposed inline completion", async ({ q }) => {
    const combobox = q.combobox("Your favorite drink");

    await combobox.click();
    await combobox.pressSequentially(decomposedCafe);
    await expectSafeValue(
      () => combobox.inputValue(),
      [decomposedCafe, "caféteria"],
    );

    await q.button("Save").click();
    await expectSafeValue(
      () => q.status().textContent(),
      [decomposedCafe, "caféteria"],
    );
  });

  test("does not drop completion characters after decomposed input", async ({
    q,
  }) => {
    const combobox = q.combobox("Your favorite drink");

    await combobox.click();
    await combobox.pressSequentially(decomposedCafet);
    await expectSafeValue(
      () => combobox.inputValue(),
      [decomposedCafet, "caféteria"],
    );

    await q.button("Save").click();
    await expectSafeValue(
      () => q.status().textContent(),
      [decomposedCafet, "caféteria"],
    );
  });
});
