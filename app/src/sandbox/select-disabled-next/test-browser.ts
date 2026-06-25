import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("closed select does not move to a disabled item", async ({
    page,
    q,
  }) => {
    await q.combobox("Single disabled fruit").focus();
    await test
      .expect(q.status("Single disabled fruit active item"))
      .toHaveText("None");
    await test
      .expect(q.status("Single disabled fruit value"))
      .toHaveText("None");
    await test
      .expect(q.status("Single disabled fruit item disabled"))
      .toHaveText("true");
    await test
      .expect(q.status("Single disabled fruit rendered disabled"))
      .toHaveText("false");

    await page.keyboard.press("ArrowDown");

    await test
      .expect(q.status("Single disabled fruit active item"))
      .toHaveText("None");
    await test
      .expect(q.status("Single disabled fruit value"))
      .toHaveText("None");
  });

  test("closed select skips controlled disabled items", async ({ page, q }) => {
    await q.combobox("Mixed fruit").focus();
    await test.expect(q.status("Mixed fruit active item")).toHaveText("None");
    await test.expect(q.status("Mixed fruit value")).toHaveText("None");
    await test.expect(q.status("Mixed fruit item disabled")).toHaveText("true");
    await test
      .expect(q.status("Mixed fruit rendered disabled"))
      .toHaveText("false");

    await page.keyboard.press("ArrowDown");

    await test.expect(q.status("Mixed fruit active item")).toHaveText("orange");
    await test.expect(q.status("Mixed fruit value")).toHaveText("Orange");

    await page.keyboard.press("ArrowUp");

    await test.expect(q.status("Mixed fruit active item")).toHaveText("orange");
    await test.expect(q.status("Mixed fruit value")).toHaveText("Orange");
  });

  test("closed select skips valueless items", async ({ page, q }) => {
    await q.combobox("Valueless fruit").focus();
    await test
      .expect(q.status("Valueless fruit active item"))
      .toHaveText("None");
    await test.expect(q.status("Valueless fruit value")).toHaveText("None");

    await page.keyboard.press("ArrowDown");

    await test
      .expect(q.status("Valueless fruit active item"))
      .toHaveText("pear");
    await test.expect(q.status("Valueless fruit value")).toHaveText("Pear");
  });
});
