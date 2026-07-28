import { gotoAndSettle, withFramework } from "#app/test-utils/preview.ts";

const leakedAttributes = [
  "accessiblewhendisabled",
  "clickonenter",
  "clickonspace",
  "focusable",
  "shouldregisteritem",
  "typeaheadtext",
] as const;

withFramework(import.meta.dirname, async ({ test }) => {
  test("omits composite option props from the offscreen placeholder", async ({
    page,
    q,
  }) => {
    const reactWarnings: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "warning" || message.type() === "error") {
        reactWarnings.push(message.text());
      }
    });

    await gotoAndSettle(page, page.url());

    const item = q.button("Archive");
    await test.expect(item).toHaveAttribute("data-offscreen");
    await test.expect(item).toHaveAttribute("aria-disabled", "true");
    await test
      .expect(item)
      .toHaveAttribute("data-typeahead-text", "Archive command");
    await test.expect(item).not.toHaveAttribute("disabled");

    for (const attribute of leakedAttributes) {
      await test.expect(item).not.toHaveAttribute(attribute);
    }

    test.expect(reactWarnings).toEqual([]);
  });
});
