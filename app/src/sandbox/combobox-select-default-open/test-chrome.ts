import { withFramework } from "#app/test-utils/preview.ts";
import { expectVerticallyCentered } from "#app/test-utils/scroll.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/7068
  test("presents the selected item when the popup starts open", async ({
    q,
  }) => {
    const onion = q.option("Onion");
    await test.expect(onion).toHaveAttribute("data-active-item");

    await expectVerticallyCentered(q.listbox(), onion);
  });
});
