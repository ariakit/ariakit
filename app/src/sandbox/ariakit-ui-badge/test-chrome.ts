import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ query, test }) => {
  // A badge is phrasing content, so the parser keeps it inside a paragraph, and
  // a heading, which holds phrasing content only, can hold it.
  test("renders a badge as phrasing content", async ({ q }) => {
    const inText = query(q.article("In running text"))
      .text("v0.2")
      .locator("..");
    await test.expect(inText).toHaveJSProperty("tagName", "SPAN");
    await test.expect(inText.locator("..")).toHaveJSProperty("tagName", "P");

    const box = query(q.article("Auto size in a heading"));
    const heading = box.heading(/^Changelog/);
    await test.expect(heading.locator(":scope > div")).toHaveCount(0);
    await test
      .expect(box.text("Latest").locator(".."))
      .toHaveJSProperty("tagName", "SPAN");
  });
});
