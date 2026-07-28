import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("expands and collapses through the grid transition", async ({
    page,
    q,
  }) => {
    const disclosure = q.button("What are vegetables?");
    const content = q.text(
      "Vegetables are parts of plants that are consumed as food.",
    );
    const wrapper = page.locator(".content-wrapper");

    await test.expect(wrapper).not.toBeVisible();
    await disclosure.click();
    await test.expect(wrapper).toBeVisible();

    const height = await content.evaluate((element) => element.clientHeight);
    const expandedRows = `${height}px`;
    await test
      .expect(wrapper)
      .not.toHaveCSS("grid-template-rows", expandedRows);
    await test.expect(wrapper).toHaveCSS("grid-template-rows", expandedRows);

    await disclosure.click();
    await test.expect(wrapper).toBeVisible();
    await test
      .expect(wrapper)
      .not.toHaveCSS("grid-template-rows", expandedRows);
    await test.expect(wrapper).toHaveCSS("grid-template-rows", "0fr");
    await test.expect(wrapper).not.toBeVisible();

    await disclosure.press("Enter");
    await test.expect(wrapper).toBeVisible();
    await test
      .expect(wrapper)
      .not.toHaveCSS("grid-template-rows", expandedRows);
    await test.expect(wrapper).toHaveCSS("grid-template-rows", expandedRows);

    await disclosure.press("Enter");
    await test.expect(wrapper).toBeVisible();
    await test.expect(wrapper).not.toHaveCSS("grid-template-rows", "0fr");
    await test.expect(wrapper).toHaveCSS("grid-template-rows", "0fr");
    await test.expect(wrapper).not.toBeVisible();
  });
});
