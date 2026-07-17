import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  // https://github.com/ariakit/ariakit/issues/5179
  test("lets a child handle Escape before the dialog", async ({ page, q }) => {
    await q.button("Open dialog").click();
    await test.expect(q.dialog("Dialog")).toBeVisible();
    await test.expect(q.combobox("Search")).toBeFocused();
    await test.expect(q.listbox("Suggestions")).toBeVisible();

    await page.keyboard.press("Escape");

    await test.expect(q.listbox("Suggestions")).toBeHidden();
    await test.expect(q.dialog("Dialog")).toBeVisible();

    await page.keyboard.press("Escape");

    await test.expect(q.dialog("Dialog")).toBeHidden();
  });

  for (const portal of ["Ariakit Portal", "React portal"]) {
    test(`lets a ${portal} child handle Escape before the dialog`, async ({
      q,
    }) => {
      const dialogName = `${portal} child dialog`;
      await q.button(`Open ${dialogName.toLowerCase()}`).click();
      const input = q.combobox("Search");
      await test.expect(q.dialog(dialogName)).toBeVisible();
      await test.expect(q.listbox("Suggestions")).toBeVisible();

      await input.focus();
      await test.expect(input).toBeFocused();
      await test.expect(q.dialog(dialogName)).toBeVisible();

      await input.press("Escape");

      await test.expect(q.listbox("Suggestions")).toBeHidden();
      await test.expect(q.dialog(dialogName)).toBeVisible();

      await input.press("Escape");

      await test.expect(q.dialog(dialogName)).toBeHidden();
    });
  }

  test("lets an ancestor capture handler own Escape", async ({ q }) => {
    await q.button("Open outer capture dialog").click();
    const dialog = q.dialog("Outer capture dialog");
    const dialogQuery = query(dialog);
    const input = dialogQuery.combobox("Search");

    await test.expect(dialog).toBeVisible();
    await test.expect(input).toBeFocused();
    await test.expect(dialogQuery.listbox("Suggestions")).toBeVisible();

    await input.press("Escape");

    await test.expect(dialogQuery.listbox("Suggestions")).toBeVisible();
    await test.expect(dialog).toBeVisible();
  });

  test("closes on an unclaimed Escape outside the dialog", async ({ q }) => {
    const disclosure = q.button("Open outside dialog");
    await disclosure.click();
    await test.expect(q.dialog("Outside dialog")).toBeVisible();

    await disclosure.focus();
    await disclosure.press("Escape");

    await test.expect(q.dialog("Outside dialog")).toBeHidden();
  });

  test("lets an ancestor capture handler own Escape outside", async ({ q }) => {
    const disclosure = q.button("Open outer capture dialog");
    await disclosure.click();
    await test.expect(q.dialog("Outer capture dialog")).toBeVisible();

    await disclosure.focus();
    await disclosure.press("Escape");

    await test.expect(q.dialog("Outer capture dialog")).toBeVisible();
  });

  test("hides after its own bubble handler stops Escape", async ({
    page,
    q,
  }) => {
    await q.button("Open own bubble dialog").click();
    await test.expect(q.dialog("Own bubble dialog")).toBeVisible();

    await page.keyboard.press("Escape");

    await test.expect(q.listbox("Suggestions")).toBeHidden();
    await test.expect(q.dialog("Own bubble dialog")).toBeVisible();

    await page.keyboard.press("Escape");

    await test.expect(q.dialog("Own bubble dialog")).toBeHidden();
  });

  test("hides after its own capture handler stops Escape", async ({ q }) => {
    await q.button("Open own capture dialog").click();
    const input = q.combobox("Search");
    await test.expect(q.dialog("Own capture dialog")).toBeVisible();
    await test.expect(input).toBeFocused();

    await input.press("Escape");

    await test.expect(q.dialog("Own capture dialog")).toBeHidden();
  });

  test("stops Escape before a third-party dialog bubble handler", async ({
    q,
  }) => {
    await q.button("Open third-party dialog").click();
    await q.button("Open nested ariakit dialog").click();
    await test.expect(q.dialog("Third-party dialog")).toBeVisible();
    await test.expect(q.dialog("Nested Ariakit dialog")).toBeVisible();

    await q.button("Inside nested ariakit dialog").press("Escape");

    await test.expect(q.dialog("Nested Ariakit dialog")).toBeHidden();
    await test.expect(q.dialog("Third-party dialog")).toBeVisible();
  });

  test("can stop Escape before a third-party dialog capture handler", async ({
    q,
  }) => {
    await q.button("Open capture third-party dialog").click();
    await q.button("Open shielded ariakit dialog").click();
    await test.expect(q.dialog("Capture third-party dialog")).toBeVisible();
    await test.expect(q.dialog("Shielded Ariakit dialog")).toBeVisible();

    await q.button("Inside shielded ariakit dialog").press("Escape");

    await test.expect(q.dialog("Shielded Ariakit dialog")).toBeHidden();
    await test.expect(q.dialog("Capture third-party dialog")).toBeVisible();
  });

  test("calls a rejected hideOnEscape callback once", async ({ q }) => {
    await q.button("Open rejected callback dialog").click();
    const dialog = q.dialog("Rejected callback dialog");
    const dialogQuery = query(dialog);
    await test.expect(dialog).toBeVisible();

    await dialogQuery.button("Callback calls: 0").press("Escape");

    await test.expect(dialog).toBeVisible();
    await test.expect(dialogQuery.button("Callback calls: 1")).toBeVisible();
  });

  test("hides when hideOnEscape stops Escape from a React portal", async ({
    q,
  }) => {
    await q.button("Open react portal callback dialog").click();
    const dialog = q.dialog("React portal callback dialog");
    const button = q.button("Callback calls: 0");
    await test.expect(dialog).toBeVisible();

    await button.focus();
    await button.press("Escape");

    await test.expect(dialog).toBeHidden();
  });

  test("respects a child handler delegated to document", async ({
    page,
    q,
  }) => {
    await q.button("Show document root example").click();
    const frame = query(
      page.frameLocator('iframe[title="Document root example"]'),
    );
    const openDialog = frame.button("Open document root dialog");
    const dialog = frame.dialog("Document root dialog");
    const dialogQuery = query(dialog);
    const input = dialogQuery.combobox("Search");
    const listbox = dialogQuery.listbox("Suggestions");

    await openDialog.click();
    await test.expect(input).toBeFocused();
    await test.expect(listbox).toBeVisible();

    await input.press("Escape");

    await test.expect(listbox).toBeHidden();
    await test.expect(dialog).toBeVisible();

    await input.press("Escape");

    await test.expect(dialog).toBeHidden();
  });

  test("respects a child capture handler delegated to document", async ({
    page,
    q,
  }) => {
    await q.button("Show document root example").click();
    const frame = query(
      page.frameLocator('iframe[title="Document root example"]'),
    );
    const openDialog = frame.button("Open document root capture dialog");
    const dialog = frame.dialog("Document root capture dialog");
    const dialogQuery = query(dialog);
    const input = dialogQuery.combobox("Search");
    const listbox = dialogQuery.listbox("Suggestions");

    await openDialog.click();
    await test.expect(input).toBeFocused();
    await test.expect(listbox).toBeVisible();

    await input.press("Escape");

    await test.expect(listbox).toBeHidden();
    await test.expect(dialog).toBeVisible();

    await input.press("Escape");

    await test.expect(dialog).toBeHidden();
  });

  test("hides after its own bubble handler delegated to document", async ({
    page,
    q,
  }) => {
    await q.button("Show document root example").click();
    const frame = query(
      page.frameLocator('iframe[title="Document root example"]'),
    );
    const openDialog = frame.button("Open document root own bubble dialog");
    const dialog = frame.dialog("Document root own bubble dialog");
    const dialogQuery = query(dialog);
    const input = dialogQuery.combobox("Search");
    const listbox = dialogQuery.listbox("Suggestions");

    await openDialog.click();
    await test.expect(input).toBeFocused();
    await test.expect(listbox).toBeVisible();

    await input.press("Escape");

    await test.expect(listbox).toBeHidden();
    await test.expect(dialog).toBeVisible();

    await input.press("Escape");

    await test.expect(dialog).toBeHidden();
  });

  test("hides after its own capture handler delegated to document", async ({
    page,
    q,
  }) => {
    await q.button("Show document root example").click();
    const frame = query(
      page.frameLocator('iframe[title="Document root example"]'),
    );
    const openDialog = frame.button("Open document root own capture dialog");
    const dialog = frame.dialog("Document root own capture dialog");
    const dialogQuery = query(dialog);
    const input = dialogQuery.combobox("Search");

    await openDialog.click();
    await test.expect(input).toBeFocused();
    await test.expect(dialog).toBeVisible();

    await input.press("Escape");

    await test.expect(dialog).toBeHidden();
  });

  test("hides when hideOnEscape stops Escape in a document root", async ({
    page,
    q,
  }) => {
    await q.button("Show document root example").click();
    const frame = query(
      page.frameLocator('iframe[title="Document root example"]'),
    );
    const dialog = frame.dialog("Document root callback dialog");
    await frame.button("Open document root callback dialog").click();
    await test.expect(dialog).toBeVisible();

    await query(dialog).button("Callback calls: 0").press("Escape");

    await test.expect(dialog).toBeHidden();
  });

  test("closes on global Escape outside a document-root dialog", async ({
    page,
    q,
  }) => {
    await q.button("Show document root example").click();
    const frame = query(
      page.frameLocator('iframe[title="Document root example"]'),
    );
    const disclosure = frame.button("Open document root global dialog");
    const dialog = frame.dialog("Document root global dialog");

    await disclosure.click();
    await test.expect(dialog).toBeVisible();

    await disclosure.focus();
    await disclosure.press("Escape");

    await test.expect(dialog).toBeHidden();
  });

  test("lets an ancestor capture handler own global Escape", async ({
    page,
    q,
  }) => {
    await q.button("Show document root example").click();
    const frame = query(
      page.frameLocator('iframe[title="Document root example"]'),
    );
    const disclosure = frame.button("Open document root outside dialog");
    const dialog = frame.dialog("Document root outside dialog");

    await disclosure.click();
    await test.expect(dialog).toBeVisible();

    await disclosure.focus();
    await test.expect(disclosure).toBeFocused();
    await disclosure.press("Escape");

    await test.expect(dialog).toBeVisible();
  });

  test("lets an ancestor capture handler own Escape in a document root", async ({
    page,
    q,
  }) => {
    await q.button("Show document root example").click();
    const frame = query(
      page.frameLocator('iframe[title="Document root example"]'),
    );
    await frame.button("Open document root outside dialog").click();

    const dialog = frame.dialog("Document root outside dialog");
    const dialogQuery = query(dialog);
    const input = dialogQuery.combobox("Search");
    const listbox = dialogQuery.listbox("Suggestions");

    await test.expect(dialog).toBeVisible();
    await test.expect(input).toBeFocused();
    await test.expect(listbox).toBeVisible();

    await input.press("Escape");

    await test.expect(listbox).toBeVisible();
    await test.expect(dialog).toBeVisible();
  });
});
