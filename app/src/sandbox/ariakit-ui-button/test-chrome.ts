import { tabInto } from "#app/test-utils/ariakit-ui.ts";
import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ query, test }) => {
  // https://github.com/ariakit/ariakit/pull/7489#discussion_r3995226174
  test("preserves the selected avatar color when its kind changes", async ({
    q,
  }) => {
    const box = query(q.article("Avatar shape"));
    const picture = box.button("Change avatar color");
    const image = picture.locator("img");
    await test.expect(image).toHaveAttribute("src", /f59e0b/);
    await picture.click();
    await test.expect(image).toHaveAttribute("src", /6366f1/);
    const round = box.button("Round avatar");
    await round.click();
    await test.expect(round).toHaveAttribute("aria-pressed", "false");
    await test.expect(image).toHaveAttribute("src", /6366f1/);
    await round.click();
    await test.expect(round).toHaveAttribute("aria-pressed", "true");
    await test.expect(image).toHaveAttribute("src", /6366f1/);
  });

  test("keeps a focusable disabled button in the tab order", async ({
    page,
    q,
  }) => {
    const focusable = query(q.article("Focusable disabled"));
    const button = focusable.button("Export");
    await test.expect(button).toHaveAttribute("aria-disabled", "true");
    await test.expect(button).not.toHaveAttribute("disabled");
    await tabInto(page, q.article("Focusable disabled"));
    await test.expect(button).toBeFocused();

    // A natively disabled button is not a stop, so Tab passes it by.
    const native = query(q.article("Disabled bevel"));
    await tabInto(page, q.article("Disabled bevel"));
    await test.expect(native.button("Archive")).not.toBeFocused();
    await test.expect(page.locator("main :focus")).toHaveCount(1);
  });

  test("checks the clicked radio of a button radio group", async ({ q }) => {
    const segmented = query(
      query(q.article("Segmented control")).radiogroup("View"),
    );
    await test.expect(segmented.radio("List")).toBeChecked();
    await segmented.radio("Grid").click();
    await test.expect(segmented.radio("Grid")).toBeChecked();
    await test.expect(segmented.radio("List")).not.toBeChecked();

    const vertical = query(
      query(q.article("Vertical bar glider")).radiogroup("Theme"),
    );
    await test.expect(vertical.radio("System")).toBeChecked();
    await vertical.radio("Dark").click();
    await test.expect(vertical.radio("Dark")).toBeChecked();
    await test.expect(vertical.radio("System")).not.toBeChecked();
  });
});
