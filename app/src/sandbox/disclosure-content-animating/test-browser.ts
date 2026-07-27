import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/4115
  test("reports animating while opening and closing", async ({ q }) => {
    const content = q.text("Content");
    await test.expect(content).not.toHaveAttribute("data-animating");

    await q.button("Toggle").click();
    await test.expect(content).toHaveAttribute("data-animating");
    await test.expect(content).not.toHaveAttribute("data-animating");

    await q.button("Toggle").click();
    await test.expect(content).toHaveAttribute("data-animating");
    await test.expect(content).not.toHaveAttribute("data-animating");
  });
});
