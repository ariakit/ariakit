import { withFramework } from "#app/test-utils/preview.ts";

const NO_POINTER_CLICK =
  'PointerEvent, own window, pointerId -1, pointerType ""';
const CLICK_METADATA = "view own window, composed true";

withFramework(import.meta.dirname, async ({ test, query }) => {
  // https://github.com/ariakit/ariakit/issues/7171
  test("Enter dispatches a PointerEvent with no pointer behind it", async ({
    page,
    q,
  }) => {
    const events = query(q.list("Document click events")).listitem();
    await q.button("Report click").focus();

    await page.keyboard.press("Enter");
    await test.expect(events).toHaveText([NO_POINTER_CLICK]);
  });

  // https://github.com/ariakit/ariakit/issues/7171
  //
  // Space dispatches the click from the keyup handler, a separate path from
  // Enter's keydown handler in `Command`.
  test("Space dispatches a PointerEvent with no pointer behind it", async ({
    page,
    q,
  }) => {
    const events = query(q.list("Document click events")).listitem();
    await q.button("Report click").focus();

    await page.keyboard.press("Space");
    await test.expect(events).toHaveText([NO_POINTER_CLICK]);
  });

  // https://github.com/ariakit/ariakit/issues/7171
  //
  // A same-origin frame owns its own constructors, so the click has to be built
  // by the frame's window for a listener inside it to recognize it. happy-dom
  // shares one set of constructors between a frame and its parent, so this half
  // has no duplicate in `test.ts`.
  test("Enter inside a frame dispatches an event built by the frame's window", async ({
    page,
    q,
  }) => {
    const frame = query(page.frameLocator("iframe[title='Command frame']"));
    const events = query(q.list("Frame click events")).listitem();
    await frame.button("Frame command").focus();

    await page.keyboard.press("Enter");
    await test.expect(events).toHaveText([NO_POINTER_CLICK]);
  });

  // https://github.com/ariakit/ariakit/issues/7171
  test("Space inside a frame dispatches an event built by the frame's window", async ({
    page,
    q,
  }) => {
    const frame = query(page.frameLocator("iframe[title='Command frame']"));
    const events = query(q.list("Frame click events")).listitem();
    await frame.button("Frame command").focus();

    await page.keyboard.press("Space");
    await test.expect(events).toHaveText([NO_POINTER_CLICK]);
  });

  // https://github.com/ariakit/ariakit/issues/7192
  test("Enter dispatches a click with its own view that is composed", async ({
    page,
    q,
  }) => {
    const metadata = query(q.list("Document click metadata")).listitem();
    await q.button("Report click").focus();

    await page.keyboard.press("Enter");
    await test.expect(metadata).toHaveText([CLICK_METADATA]);
  });

  // https://github.com/ariakit/ariakit/issues/7192
  test("Space inside a frame dispatches a click with its own view that is composed", async ({
    page,
    q,
  }) => {
    const frame = query(page.frameLocator("iframe[title='Command frame']"));
    const metadata = query(q.list("Frame click metadata")).listitem();
    await frame.button("Frame command").focus();

    await page.keyboard.press("Space");
    await test.expect(metadata).toHaveText([CLICK_METADATA]);
  });

  // https://github.com/ariakit/ariakit/issues/7192
  test("keyboard clicks cross a shadow boundary", async ({ page, q }) => {
    const command = q.button("Shadow command");
    const status = q.status();
    await command.focus();

    await page.keyboard.press("Enter");
    await test.expect(status).toHaveText("Outer shadow clicks: 1");

    await page.keyboard.press("Space");
    await test.expect(status).toHaveText("Outer shadow clicks: 2");
  });
});
