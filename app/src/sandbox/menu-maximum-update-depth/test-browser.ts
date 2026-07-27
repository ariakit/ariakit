import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("renders and independently opens sixty menu stores", async ({
    page,
  }) => {
    const buttons = page.getByRole("button", { name: "Menu" });
    await test.expect(buttons).toHaveCount(60);
    await buttons.last().click();
    await test.expect(page.getByRole("menu")).toBeVisible();
    await test.expect(page.getByRole("menuitem", { name: "A" })).toBeVisible();
  });
});
