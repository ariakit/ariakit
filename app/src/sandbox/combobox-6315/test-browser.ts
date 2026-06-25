import { withFramework } from "#app/test-utils/preview.ts";

const decomposedCafe = "cafe\u0301";
const decomposedCafet = `${decomposedCafe}t`;
const decomposedCafeteria = `${decomposedCafe}teria`;
const composedCafeteria = "caféteria";

// https://github.com/ariakit/ariakit/issues/6315
withFramework(import.meta.dirname, async ({ test }) => {
  const expectSafeValue = async (
    value: () => Promise<string | null>,
    expectedValues: string[],
  ) => {
    await test.expect
      .poll(async () => {
        const currentValue = await value();
        if (currentValue == null) return "";
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
      [decomposedCafe, decomposedCafeteria, composedCafeteria],
    );

    await q.button("Save").click();
    await expectSafeValue(
      () => q.status().textContent(),
      [decomposedCafe, decomposedCafeteria, composedCafeteria],
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
      [decomposedCafet, decomposedCafeteria, composedCafeteria],
    );

    await q.button("Save").click();
    await expectSafeValue(
      () => q.status().textContent(),
      [decomposedCafet, decomposedCafeteria, composedCafeteria],
    );
  });

  test("completes unaccented input against accented items", async ({ q }) => {
    const combobox = q.combobox("Your favorite drink");

    await combobox.click();
    await combobox.pressSequentially("cafe ");
    await test.expect(combobox).toHaveValue("cafe au lait");

    await q.button("Save").click();
    await test.expect(q.status()).toHaveText("cafe au lait");
  });
});
