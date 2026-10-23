import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("names and describes a group, a select, and a textarea", async ({
    q,
  }) => {
    await test.expect(q.textbox("Website")).toHaveValue("ada.dev");
    await test
      .expect(q.combobox("Country"))
      .toHaveAccessibleDescription("Sets your currency.");
    await test
      .expect(q.textbox("Bio"))
      .toHaveAccessibleDescription("Up to 160 characters.");
  });

  test("stops the bio at the length that its hint states", async ({ q }) => {
    const bio = q.textbox("Bio");
    await bio.clear();
    await bio.pressSequentially("a".repeat(170));
    await test.expect(bio).toHaveValue("a".repeat(160));
  });

  test("focuses the select from a click between its label and the select", async ({
    page,
    q,
  }) => {
    const select = q.combobox("Country");
    const label = await q.text("Country").boundingBox();
    const box = await select.boundingBox();
    test.expect(label).not.toBeNull();
    test.expect(box).not.toBeNull();
    if (!label || !box) return;
    await page.mouse.click(label.x + 4, box.y - 2);
    await test.expect(select).toBeFocused();
  });

  test("focuses the website from a click on its prefix", async ({ q }) => {
    await q.text("https://").click();
    await test.expect(q.textbox("Website")).toBeFocused();
  });
});
