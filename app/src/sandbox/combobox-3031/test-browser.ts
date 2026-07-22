import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  // https://github.com/ariakit/ariakit/issues/3031
  test("hides the popover when focus moves to a sibling iframe", async ({
    page,
  }) => {
    const siblingIframe = page.locator("iframe[title='Sibling frame']");
    const frame = query(page.frameLocator("iframe[title='Embedded content']"));
    await frame.combobox("Favorite food").click();
    await test.expect(frame.listbox("Suggestions")).toBeVisible();

    await page.keyboard.press("Tab");

    await test.expect(siblingIframe).toBeFocused();
    await test.expect(frame.listbox("Suggestions")).not.toBeVisible();
  });

  // https://github.com/ariakit/ariakit/issues/3031
  test("passes parent focus to hideOnInteractOutside", async ({ page, q }) => {
    const frame = query(page.frameLocator("iframe[title='Embedded content']"));
    await frame.button("Open focused dialog").click();
    await test.expect(frame.dialog("Focused dialog")).toBeVisible();
    await test.expect(frame.dialog("Focused dialog")).toBeFocused();

    await q.button("After iframe").focus();

    await test.expect(q.button("After iframe")).toBeFocused();
    await test.expect(frame.dialog("Focused dialog")).toBeVisible();
    await test.expect(frame.text("Outside target: After iframe")).toBeVisible();

    await frame.dialog("Focused dialog").focus();
    await q.button("After iframe").focus();

    await test.expect(q.button("After iframe")).toBeFocused();
    await test.expect(frame.dialog("Focused dialog")).not.toBeVisible();
  });

  // https://github.com/ariakit/ariakit/issues/3031
  test("passes iframe host focus to hideOnInteractOutside", async ({
    page,
  }) => {
    const siblingIframe = page.locator("iframe[title='Sibling frame']");
    const frame = query(page.frameLocator("iframe[title='Embedded content']"));
    await frame.button("Open focused dialog").click();
    await test.expect(frame.dialog("Focused dialog")).toBeFocused();

    // The dialog itself is programmatically focused, so the first Tab resumes
    // the frame's document order at the combobox and the second reaches the
    // sibling iframe.
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");

    await test.expect(siblingIframe).toBeFocused();
    await test.expect(frame.dialog("Focused dialog")).toBeVisible();
    await test
      .expect(frame.text("Outside target: Sibling frame"))
      .toBeVisible();

    await frame.dialog("Focused dialog").focus();
    await siblingIframe.focus();

    await test.expect(frame.dialog("Focused dialog")).not.toBeVisible();
  });

  // https://github.com/ariakit/ariakit/issues/3031
  test("passes the native iframe focus event to the callback", async ({
    page,
    q,
  }) => {
    const outsideFrame = page.locator("iframe[title='Root outside frame']");
    await q.button("Open root dialog").click();
    await test.expect(q.dialog("Root dialog")).toBeFocused();

    await page.keyboard.press("Tab");

    await test.expect(outsideFrame).toBeFocused();
    await test.expect(q.dialog("Root dialog")).not.toBeVisible();
    await test
      .expect(
        q.text(
          "Root outside event: focus; trusted: true; " +
            "current target: null; path: 0",
        ),
      )
      .toBeVisible();
  });

  // https://github.com/ariakit/ariakit/issues/3031
  test("preserves pending iframe focus across frame refreshes", async ({
    page,
    q,
  }) => {
    await q.button("Open root dialog").click();
    await test.expect(q.dialog("Root dialog")).toBeFocused();
    await page.evaluate(() => {
      const outsideFrame = document.querySelector<HTMLIFrameElement>(
        "iframe[title='Root outside frame']",
      );
      const outsideWindow = outsideFrame?.contentWindow;
      if (!outsideFrame || !outsideWindow) {
        throw new Error("Expected iframe contentWindow");
      }
      outsideWindow.addEventListener(
        "focus",
        () => {
          const frameDocument = outsideFrame.contentDocument;
          if (!frameDocument) {
            throw new Error("Expected iframe contentDocument");
          }
          const frame = frameDocument.createElement("iframe");
          frame.hidden = true;
          frameDocument.body.appendChild(frame);
        },
        { once: true },
      );
    });

    await page.keyboard.press("Tab");

    await test.expect(q.dialog("Root dialog")).not.toBeVisible();
    await test
      .expect(
        q.text(
          "Root outside event: focus; trusted: true; " +
            "current target: null; path: 0",
        ),
      )
      .toBeVisible();
  });

  // https://github.com/ariakit/ariakit/issues/3031
  test("hides on click in a sibling iframe after focusin is vetoed", async ({
    page,
  }) => {
    const frame = query(page.frameLocator("iframe[title='Embedded content']"));
    const siblingFrame = query(
      page.frameLocator("iframe[title='Sibling frame']"),
    );
    await frame.button("Open click dialog").click();
    await test.expect(frame.dialog("Click dialog")).toBeVisible();
    await test.expect(frame.dialog("Click dialog")).toBeFocused();

    await siblingFrame.text("Sibling click target").click();

    await test.expect(frame.dialog("Click dialog")).not.toBeVisible();
    await test.expect(frame.text("Outside event: click")).toBeVisible();
  });

  // https://github.com/ariakit/ariakit/issues/3031
  test("keeps the dialog open when focus moves to a contained iframe", async ({
    page,
  }) => {
    const frameLocator = page.frameLocator("iframe[title='Embedded content']");
    const frame = query(frameLocator);
    const nestedFrame = query(
      frameLocator.frameLocator("iframe[title='Nested content']"),
    );
    await frame.button("Open focused dialog").click();
    await test.expect(frame.dialog("Focused dialog")).toBeVisible();

    await nestedFrame.textbox("Inside dialog frame").click();

    await test.expect(nestedFrame.textbox("Inside dialog frame")).toBeFocused();
    await test.expect(frame.dialog("Focused dialog")).toBeVisible();
  });

  // https://github.com/ariakit/ariakit/issues/3031
  test("keeps matching dialog IDs isolated across documents", async ({
    page,
    q,
  }) => {
    const firstFrame = query(
      page.frameLocator("iframe[title='Embedded content']"),
    );
    const secondFrame = query(
      page.frameLocator("iframe[title='Sibling frame']"),
    );
    await q.button("Open matching dialogs").click();
    await test.expect(firstFrame.dialog("First matching dialog")).toBeVisible();
    await test
      .expect(secondFrame.dialog("Second matching dialog"))
      .toBeVisible();

    await secondFrame.button("Second matching target").click();

    await test
      .expect(firstFrame.dialog("First matching dialog"))
      .not.toBeVisible();
    await test
      .expect(secondFrame.dialog("Second matching dialog"))
      .toBeVisible();
  });

  // https://github.com/ariakit/ariakit/issues/3031
  test("observes an outside iframe added after the dialog opens", async ({
    page,
  }) => {
    const frame = query(page.frameLocator("iframe[title='Embedded content']"));
    const lateFrame = query(
      page.frameLocator("iframe[title='Late outside frame']"),
    );
    await frame.button("Open lifecycle dialog").click();
    await frame.button("Add outside frame").click();

    await lateFrame.button("Late outside target").click();

    await test.expect(frame.dialog("Lifecycle dialog")).not.toBeVisible();
  });

  // https://github.com/ariakit/ariakit/issues/3031
  test("observes an iframe focused synchronously after insertion", async ({
    page,
    q,
  }) => {
    const outsideFrame = page.locator(
      "iframe[title='Synchronously focused frame']",
    );
    await q.button("Open root dialog").click();

    await q.button("Add and focus outside frame").click();

    await test.expect(outsideFrame).toBeFocused();
    await test.expect(q.dialog("Root dialog")).not.toBeVisible();
    await test
      .expect(
        q.text(
          "Root outside event: focus; trusted: true; " +
            "current target: null; path: 0",
        ),
      )
      .toBeVisible();
  });

  // https://github.com/ariakit/ariakit/issues/3031
  test("observes an outside iframe after it navigates", async ({ page }) => {
    const frame = query(page.frameLocator("iframe[title='Embedded content']"));
    const navigatedFrame = query(
      page.frameLocator("iframe[title='Navigated frame']"),
    );
    await frame.button("Open lifecycle dialog").click();
    await frame.button("Navigate outside frame").click();

    await navigatedFrame.button("Navigated outside target").click();

    await test.expect(frame.dialog("Lifecycle dialog")).not.toBeVisible();
  });

  // https://github.com/ariakit/ariakit/issues/3031
  test("keeps a late contained iframe inside the dialog", async ({ page }) => {
    const frameLocator = page.frameLocator("iframe[title='Embedded content']");
    const frame = query(frameLocator);
    const containedFrame = query(
      frameLocator.frameLocator("iframe[title='Late contained frame']"),
    );
    await frame.button("Open lifecycle dialog").click();
    await frame.button("Add contained frame").click();

    await containedFrame.button("Late contained target").click();

    await test.expect(frame.dialog("Lifecycle dialog")).toBeVisible();
  });

  // https://github.com/ariakit/ariakit/issues/3031
  test("cleans up listeners after an iframe becomes cross-origin", async ({
    page,
  }) => {
    const errors: Error[] = [];
    page.on("pageerror", (error) => errors.push(error));
    const frame = query(page.frameLocator("iframe[title='Embedded content']"));
    const lateFrame = query(
      page.frameLocator("iframe[title='Late outside frame']"),
    );
    await frame.button("Open lifecycle dialog").click();
    await page
      .locator("iframe[title='Cross-origin frame']")
      .evaluate((element: HTMLIFrameElement) => {
        return new Promise<void>((resolve) => {
          element.addEventListener("load", () => resolve(), { once: true });
          element.removeAttribute("srcdoc");
          element.src = "data:text/html,<p>Cross-origin frame content</p>";
        });
      });

    await frame.button("Add outside frame").click();
    await lateFrame.button("Late outside target").click();

    await test.expect(frame.dialog("Lifecycle dialog")).not.toBeVisible();
    await test.expect
      .poll(() => errors.map((error) => error.message))
      .toEqual([]);
  });
});
