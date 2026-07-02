import { withFramework } from "#app/test-utils/preview.ts";

// "Resume.pdf" with combining acute accents on the "e"s, that is, stored in
// decomposed (NFD) form.
const decomposedResume = "Re\u0301sume\u0301.pdf";

// Reproduces https://github.com/ariakit/ariakit/issues/6329
withFramework(import.meta.dirname, async ({ test }) => {
  test("highlights only the typed syllable in Hangul item values", async ({
    q,
  }) => {
    const combobox = q.combobox("Search files");
    await combobox.click();
    await combobox.pressSequentially("사");

    const option = q.option("사과.txt");
    await test.expect(option).toBeVisible();
    await test.expect(option).toHaveText("사과.txt");
    await test.expect(option.locator("[data-user-value]")).toHaveText(["사"]);
    await test
      .expect(option.locator("[data-autocomplete-value]"))
      .toHaveText(["과.txt"]);
  });

  test("highlights only the typed kana in item values with dakuten", async ({
    q,
  }) => {
    const combobox = q.combobox("Search files");
    await combobox.click();
    await combobox.pressSequentially("ガ");

    const option = q.option("ガラス.txt");
    await test.expect(option).toBeVisible();
    await test.expect(option).toHaveText("ガラス.txt");
    await test.expect(option.locator("[data-user-value]")).toHaveText(["ガ"]);
    await test
      .expect(option.locator("[data-autocomplete-value]"))
      .toHaveText(["ラス.txt"]);
  });

  test("keeps combining marks attached in decomposed item values", async ({
    q,
  }) => {
    const combobox = q.combobox("Search files");
    await combobox.click();
    await combobox.pressSequentially("sum");

    const option = q.option(decomposedResume);
    await test.expect(option).toBeVisible();
    await test.expect(option).toHaveText(decomposedResume);
    await test.expect(option.locator("[data-user-value]")).toHaveText(["sum"]);
    await test
      .expect(option.locator("[data-autocomplete-value]"))
      .toHaveText(["Re\u0301", "e\u0301.pdf"]);
  });

  test("highlights diacritic-insensitive matches in decomposed item values", async ({
    q,
  }) => {
    const combobox = q.combobox("Search files");
    await combobox.click();
    await combobox.pressSequentially("resume");

    const option = q.option(decomposedResume);
    await test.expect(option).toBeVisible();
    await test.expect(option).toHaveText(decomposedResume);
    await test
      .expect(option.locator("[data-user-value]"))
      .toHaveText(["Re\u0301sume\u0301"]);
    await test
      .expect(option.locator("[data-autocomplete-value]"))
      .toHaveText([".pdf"]);
  });
});
