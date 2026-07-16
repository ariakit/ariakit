import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // The overflow padding variable is public API and must be exposed on the
  // wrapper even while the popover is closed and hidden, before it first
  // opens.
  test("exposes the overflow padding variable on a closed popover", async ({
    page,
  }) => {
    await test.expect
      .poll(() =>
        page.evaluate(() => {
          const popover = document.querySelector(".closed-popover");
          const wrapper = popover?.parentElement;
          if (!wrapper) return null;
          return getComputedStyle(wrapper).getPropertyValue(
            "--popover-overflow-padding",
          );
        }),
      )
      .toBe("24px");
  });
});
