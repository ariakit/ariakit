import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  // https://github.com/ariakit/ariakit/issues/3031
  test("detaches listeners from a retained iframe document", async ({
    page,
  }) => {
    const iframe = page.locator("iframe[title='Navigated frame']");
    const frame = query(page.frameLocator("iframe[title='Embedded content']"));
    const navigatedFrame = query(
      page.frameLocator("iframe[title='Navigated frame']"),
    );
    await test
      .expect(navigatedFrame.text("Initial frame content"))
      .toBeVisible();
    const oldDocument = await iframe.evaluateHandle(
      (element: HTMLIFrameElement) => {
        const document = element.contentDocument;
        if (!document) throw new Error("Expected iframe contentDocument");
        return document;
      },
    );
    await frame.button("Open lifecycle dialog").click();
    await frame.button("Navigate outside frame").click();
    await test
      .expect(navigatedFrame.button("Navigated outside target"))
      .toBeVisible();

    await oldDocument.evaluate((document) => {
      const target = document.body;
      const mouseDown = document.createEvent("MouseEvent");
      mouseDown.initEvent("mousedown", true, true);
      target.dispatchEvent(mouseDown);
      const click = document.createEvent("MouseEvent");
      click.initEvent("click", true, true);
      target.dispatchEvent(click);
    });

    await test.expect(frame.dialog("Lifecycle dialog")).toBeVisible();
  });
});
