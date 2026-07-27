import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ query, test }) => {
  // examples/select-menu-default-open/test.ts
  test("checkbox menu adds an open filter and commits its value", async ({
    q,
  }) => {
    const filters = query(q.group("Checkbox filters"));
    await filters.button("Filters (0)").click();
    await filters.menuitemcheckbox("Language").click();

    const select = filters.combobox("Language:");
    await test.expect(select).toHaveAttribute("aria-expanded", "true");
    await test.expect(select).toHaveText("Language: Choose one");
    await query(filters.listbox("Language:")).option("French").click();
    await test.expect(select).toHaveText("Language: French");
    await test.expect(filters.button("Filters (1)")).toBeVisible();
  });

  // examples/select-menu-default-open-click/test.ts
  test("click menu removes an uncommitted filter on outside click", async ({
    page,
    q,
  }) => {
    const filters = query(q.group("Click filters"));
    await filters.button("Filters (0)").click();
    await filters.menuitem("Language").click();

    await test
      .expect(filters.combobox("Language:"))
      .toHaveAttribute("aria-expanded", "true");
    await page.locator("body").click({ position: { x: 0, y: 0 } });
    await test.expect(filters.button("Filters (0)")).toBeVisible();
    await test.expect(filters.combobox("Language:")).toHaveCount(0);
  });
});
