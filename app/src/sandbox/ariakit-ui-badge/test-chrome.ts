import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ query, test }) => {
  // https://github.com/ariakit/ariakit/pull/7863
  test("hides decorative badge icons and keeps meaningful slots exposed", async ({
    q,
  }) => {
    const leading = query(q.article("Leading icon"));
    const badge = leading.text("Purchased").locator("..");
    await test
      .expect(badge.locator(".control-slot"))
      .toHaveAttribute("aria-hidden", "true");

    const count = query(q.article("Trailing count")).text("12");
    await test.expect(count).toBeVisible();
    await test.expect(count.locator("..")).not.toHaveAttribute("aria-hidden");
    await test
      .expect(query(q.article("Meaningful icon")).img("Starred"))
      .toHaveAttribute("aria-hidden", "false");
  });

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
