import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("does not split IME composition text into tags", async ({ page, q }) => {
    const input = q.textbox("New tag");
    await input.focus();

    const cdp = await page.context().newCDPSession(page);

    for (const text of ["n", "ni", "ni h", "ni ha", "ni hao"]) {
      await cdp.send("Input.imeSetComposition", {
        text,
        selectionStart: text.length,
        selectionEnd: text.length,
      });
    }

    await cdp.send("Input.insertText", { text: "你好" });

    await test.expect(q.option("ni")).toBeHidden();
    await test.expect(input).toHaveValue("你好");
  });
});
