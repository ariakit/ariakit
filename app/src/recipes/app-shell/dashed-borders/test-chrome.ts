import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // The decision band spans the full width between two Prose columns, and the
  // column after it continues the note.
  test("spaces a heading after a full band like a heading after a paragraph", async ({
    q,
  }) => {
    const afterParagraph = await q
      .heading("Tasks")
      .evaluate((element) => getComputedStyle(element).marginTop);
    test.expect(afterParagraph).not.toBe("0px");
    await test
      .expect(q.heading("Notes"))
      .toHaveCSS("margin-top", afterParagraph);
  });
});
