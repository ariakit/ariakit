import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  for (const label of [
    "Select unnamed",
    "Select named",
    "Combobox unnamed",
    "Combobox named",
  ]) {
    // https://github.com/ariakit/ariakit/issues/7346
    test(`${label} keeps popup state when name changes`, async ({ q }) => {
      await q.combobox(label).click();
      const dialog = q.dialog(label);
      await test.expect(dialog).toBeVisible();
      await query(dialog).textbox("Note").fill("Buy ripe fruit");
      await query(dialog).button("Add attachment").click();
      await test.expect(query(dialog).status()).toHaveText("Attachments: 1");

      for (const included of [
        label.endsWith(" unnamed"),
        !label.endsWith(" unnamed"),
      ]) {
        await q.checkbox(`Include ${label}`).click();
        await test
          .expect(q.checkbox(`Include ${label}`))
          .toBeChecked({ checked: included });
        await test
          .expect(query(dialog).textbox("Note"))
          .toHaveValue("Buy ripe fruit");
        await test.expect(query(dialog).status()).toHaveText("Attachments: 1");
        await test
          .expect(q.form(label).locator("select"))
          .toHaveCount(included ? 1 : 0);
        await q.button(`Submit ${label}`).click();
        await test
          .expect(q.status(`${label} submission`))
          .toHaveText(included ? "Apple" : "Omitted");
      }
    });
  }
  for (const label of ["Select named", "Combobox named"]) {
    // Keeps name nonempty, so this passes before the fix too. It distinguishes
    // a rename from the empty/nonempty boundary that caused the remount.
    // https://github.com/ariakit/ariakit/issues/7346
    test(`${label} keeps popup state when name stays nonempty`, async ({
      q,
    }) => {
      await q.combobox(label).click();
      const dialog = q.dialog(label);
      await test.expect(dialog).toBeVisible();
      await query(dialog).textbox("Note").fill("Buy ripe fruit");
      await query(dialog).button("Add attachment").click();
      await test
        .expect(q.form(label).locator("select"))
        .toHaveAttribute("name", "fruit");

      await q.button(`Rename ${label}`).click();
      await test
        .expect(q.form(label).locator("select"))
        .toHaveAttribute("name", "produce");
      await test
        .expect(query(dialog).textbox("Note"))
        .toHaveValue("Buy ripe fruit");
      await test.expect(query(dialog).status()).toHaveText("Attachments: 1");
      await q.button(`Submit ${label}`).click();
      await test.expect(q.status(`${label} submission`)).toHaveText("Apple");
    });
  }
});
