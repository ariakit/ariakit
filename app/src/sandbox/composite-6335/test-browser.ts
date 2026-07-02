import { withFramework } from "#app/test-utils/preview.ts";

// Reproduces https://github.com/ariakit/ariakit/issues/6335
withFramework(import.meta.dirname, async ({ test }) => {
  test("clearing the page field does not crash the app", async ({ q }) => {
    await test.expect(q.option("Item 1")).toBeVisible();
    const input = q.spinbutton("Page");
    await input.click();
    // Clearing the field makes the page number NaN, a transient state while
    // the user types another page number
    await input.press("ControlOrMeta+a");
    await input.press("Delete");
    await test.expect(input).toHaveValue("");
    await test.expect(q.option("Item 1")).toBeVisible();
    await test.expect(q.listbox("Results")).toBeVisible();
    // The app stays usable: typing a new page number renders that page
    await input.pressSequentially("2");
    await test.expect(q.option("Item 6")).toBeVisible();
  });
});
