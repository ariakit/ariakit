import { withFramework } from "#app/test-utils/preview.ts";

// Reproduces https://github.com/ariakit/ariakit/issues/6345
withFramework(import.meta.dirname, async ({ test }) => {
  test("onChange commits the value on arrow-key selection", async ({ q }) => {
    await q.radio("apple").click();
    await test.expect(q.radio("apple")).toBeChecked();
    await test.expect(q.text("Selected fruit: apple")).toBeVisible();

    await q.radio("apple").press("ArrowDown");
    await test.expect(q.radio("orange")).toBeFocused();
    await test.expect(q.radio("orange")).toBeChecked();
    await test.expect(q.text("Selected fruit: orange")).toBeVisible();

    await q.radio("orange").press("ArrowUp");
    await test.expect(q.radio("apple")).toBeFocused();
    await test.expect(q.radio("apple")).toBeChecked();
    await test.expect(q.text("Selected fruit: apple")).toBeVisible();
  });
});
