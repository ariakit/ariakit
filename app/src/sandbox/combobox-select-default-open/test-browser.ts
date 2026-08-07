import { withFramework } from "#app/test-utils/preview.ts";
import { expectVerticallyCentered } from "#app/test-utils/scroll.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // #7068 redefines the focus contract #6832 established here: this popup
  // mounts while nothing owns focus, so it takes focus itself. One that opens
  // while another element owns focus still leaves it alone, which
  // combobox-select-focusless-open covers.
  // https://github.com/ariakit/ariakit/pull/6832
  // https://github.com/ariakit/ariakit/issues/7068
  test("takes focus when the popup starts open", async ({ q }) => {
    await test.expect(q.option("Onion")).toHaveAttribute("data-active-item");

    // Virtual focus keeps DOM focus on the select, not on the active item.
    await test.expect(q.combobox("Vegetable")).toBeFocused();
  });

  // https://github.com/ariakit/ariakit/issues/7068
  test("presents the selected item when the popup starts open", async ({
    q,
  }) => {
    const onion = q.option("Onion");
    await test.expect(onion).toHaveAttribute("data-active-item");

    await expectVerticallyCentered(q.listbox(), onion);
  });

  // https://github.com/ariakit/ariakit/issues/7068
  test("navigates from the control when the popup starts open", async ({
    page,
    q,
  }) => {
    await test.expect(q.option("Onion")).toHaveAttribute("data-active-item");

    await page.keyboard.press("ArrowDown");

    await test.expect(q.option("Parsnip")).toHaveAttribute("data-active-item");
    await test.expect(q.combobox("Vegetable")).toBeFocused();
  });
});
