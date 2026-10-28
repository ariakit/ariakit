import type { Locator } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

async function activate(button: Locator) {
  await button.focus();
  await button.press("Enter");
}

withFramework(import.meta.dirname, async ({ test, query }) => {
  for (const phase of ["capture", "bubble"] as const) {
    test(`does not reclaim Escape stopped before React's document ${phase} listener`, async ({
      page,
      q,
    }) => {
      await q.button(`Show pre-stopped ${phase} document root example`).click();
      const frame = query(
        page.frameLocator(
          `iframe[title="Pre-stopped ${phase} document root example"]`,
        ),
      );
      const name = `Document root own ${phase} dialog`;
      const dialog = frame.dialog(name);
      const disclosure = frame.button(`Open ${name.toLowerCase()}`);
      await activate(disclosure);
      const input = query(dialog).combobox("Search");
      await test.expect(dialog).toBeVisible();

      if (phase === "bubble") {
        await input.press("Escape");
        await test.expect(frame.listbox("Suggestions")).toBeHidden();
      }

      await input.press("Escape");

      await test.expect(dialog).toBeVisible();
    });
  }

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

    await activate(openDialog);
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

    await activate(openDialog);
    await test.expect(input).toBeFocused();
    await test.expect(listbox).toBeVisible();

    await input.press("Escape");

    await test.expect(listbox).toBeHidden();
    await test.expect(dialog).toBeVisible();

    await input.press("Escape");

    await test.expect(dialog).toBeHidden();
  });

  test("respects default prevention delegated to document", async ({
    page,
    q,
  }) => {
    await q.button("Show document root example").click();
    const frame = query(
      page.frameLocator('iframe[title="Document root example"]'),
    );
    const dialog = frame.dialog("Document root prevented dialog");
    const dialogQuery = query(dialog);
    const input = dialogQuery.combobox("Search");
    const listbox = dialogQuery.listbox("Suggestions");

    await activate(frame.button("Open document root prevented dialog"));
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

    await activate(openDialog);
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

    await activate(openDialog);
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
    await activate(frame.button("Open document root callback dialog"));
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

    await activate(disclosure);
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

    await activate(disclosure);
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
    await activate(frame.button("Open document root outside dialog"));

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
