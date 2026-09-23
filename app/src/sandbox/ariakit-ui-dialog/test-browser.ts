import {
  capturePage,
  forEachColorScheme,
  getViewportCapture,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";
import { setVisonautItem } from "#app/test-utils/visonaut.ts";

withCaptures(import.meta.dirname, async ({ query, test }) => {
  const dialogs = [
    {
      box: "Default",
      disclosure: "View receipt",
      name: "Success",
      item: "ui/dialog/test-browser/opens-the-success-dialog",
    },
    {
      box: "Scroll body with header and footer",
      disclosure: "Release notes",
      name: "Release notes",
      item: "ui/dialog/test-browser/opens-the-release-notes-dialog",
    },
    {
      box: "Brand surface",
      disclosure: "Upgrade",
      name: "Upgrade to Pro",
      item: "ui/dialog/test-browser/opens-the-upgrade-to-pro-dialog",
    },
  ];

  test("page @visual", async ({ page, visual }) => {
    setVisonautItem("ui/dialog/test-browser/page");
    await forEachColorScheme(page, (colorScheme) =>
      capturePage(page, visual, colorScheme),
    );
  });

  // A dialog covers the viewport with its backdrop, which washes the page
  // behind it, so these capture the viewport.
  for (const { box, disclosure, name, item } of dialogs) {
    test(`opens the ${name} dialog @visual`, async ({ page, q, visual }) => {
      setVisonautItem(item);
      await forEachColorScheme(page, async (colorScheme) => {
        await query(q.article(box)).button(disclosure).click();
        await test.expect(q.dialog(name)).toBeVisible();
        await visual(getViewportCapture(page, colorScheme));
      });
    });
  }

  test("opens a nested dialog over the dialog that opened it @visual", async ({
    page,
    q,
    visual,
  }) => {
    setVisonautItem(
      "ui/dialog/test-browser/opens-a-nested-dialog-over-the-dialog-that-opened-it",
    );
    await forEachColorScheme(page, async (colorScheme) => {
      await q.button("Project settings").click();
      await query(q.dialog("Project settings"))
        .button("Delete project")
        .click();
      await test.expect(q.dialog("Delete project?")).toBeVisible();
      await visual(getViewportCapture(page, colorScheme));
    });
  });
});
