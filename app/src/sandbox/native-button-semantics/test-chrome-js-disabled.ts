import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test.use({ javaScriptEnabled: false });

  // https://github.com/ariakit/ariakit/issues/7112
  test("serves disabled anchor semantics before hydration", async ({ q }) => {
    const disabled = q.text("Disabled anchor");
    await test.expect(disabled).toHaveAttribute("role", "link");
    await test.expect(disabled).toHaveAttribute("tabindex", "-1");
    await test.expect(disabled).not.toHaveAttribute("disabled");

    const accessible = q.text("Disabled accessible anchor");
    await test.expect(accessible).toHaveAttribute("role", "link");
    await test.expect(accessible).toHaveAttribute("tabindex", "0");
    await test.expect(accessible).not.toHaveAttribute("disabled");
  });
});
