import {
  capturePage,
  forEachColorScheme,
  getViewportCapture,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";

withCaptures(import.meta.dirname, async ({ query, test }) => {
  const dialogs = [
    {
      key: "success",
      box: "Default",
      disclosure: "View receipt",
      name: "Success",
    },
    {
      key: "release-notes",
      box: "Scroll body with header and footer",
      disclosure: "Release notes",
      name: "Release notes",
    },
    {
      key: "upgrade",
      box: "Brand surface",
      disclosure: "Upgrade",
      name: "Upgrade to Pro",
    },
  ];

  test("page @visual", async ({ page, visual }) => {
    await forEachColorScheme(page, (colorScheme) =>
      capturePage({
        page,
        visual,
        colorScheme,
        item: "ariakit-ui-dialog/page",
      }),
    );
  });

  // A dialog covers the viewport with its backdrop, which washes the page
  // behind it, so these capture the viewport.
  for (const { key, box, disclosure, name } of dialogs) {
    test(`opens the ${name} dialog @visual`, async ({ page, q, visual }) => {
      await forEachColorScheme(page, async (colorScheme) => {
        await query(q.article(box)).button(disclosure).click();
        await test.expect(q.dialog(name)).toBeVisible();
        await visual(
          getViewportCapture(
            page,
            colorScheme,
            `ariakit-ui-dialog/${key}-open`,
          ),
        );
      });
    });
  }

  test("opens a nested dialog over the dialog that opened it @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorScheme(page, async (colorScheme) => {
      await q.button("Project settings").click();
      await query(q.dialog("Project settings"))
        .button("Delete project")
        .click();
      await test.expect(q.dialog("Delete project?")).toBeVisible();
      await visual(
        getViewportCapture(
          page,
          colorScheme,
          "ariakit-ui-dialog/nested-dialog-open",
        ),
      );
    });
  });
});
