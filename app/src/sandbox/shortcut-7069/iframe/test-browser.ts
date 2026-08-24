import type { Locator } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

async function getRefreshShortcut(button: Locator) {
  const keys = await button.getAttribute("aria-keyshortcuts");
  if (!keys?.match(/^(Control\+Shift|Shift\+Meta)\+P$/)) {
    throw new Error(`Unexpected refresh shortcut: ${keys}`);
  }
  return keys;
}

withFramework(import.meta.dirname, async ({ test, query }) => {
  // https://github.com/ariakit/ariakit/issues/7069
  test("runs the external command from React and the parent document", async ({
    page,
    q,
  }) => {
    await test
      .expect(q.region("Homepage preview"))
      .toHaveAccessibleName("Homepage preview");
    const refreshes = q.status("Preview refreshes");
    const refreshButton = q.button(/^Refresh preview/);
    await test.expect(refreshButton).toHaveAccessibleName("Refresh preview");
    await test.expect(refreshButton).toContainText("P");

    await refreshButton.click();
    await test.expect(refreshes).toHaveText("1 preview refreshes");
    await test.expect(q.text("Refresh from programmatic")).toBeVisible();

    await q.button("Publish").focus();
    await page.keyboard.press(await getRefreshShortcut(refreshButton));
    await test.expect(refreshes).toHaveText("2 preview refreshes");
    await test.expect(q.text("Refresh from keyboard").first()).toBeVisible();
  });

  // happy-dom does not model iframe listener attachment as an independent
  // browser document, so this lifecycle stays browser-only.
  // https://github.com/ariakit/ariakit/issues/7069
  test("attaches and detaches the same store from the frame document", async ({
    page,
    q,
  }) => {
    const frame = query(
      page.frameLocator('iframe[title="Live preview canvas"]'),
    );
    const canvasButton = frame.button("Select hero card");
    const refreshes = q.status("Preview refreshes");
    const attachment = q.status("Frame attachment");
    const shortcut = await getRefreshShortcut(q.button(/^Refresh preview/));

    await canvasButton.focus();
    await page.keyboard.press(shortcut);
    await test.expect(refreshes).toHaveText("0 preview refreshes");

    await q.checkbox("Attach frame shortcuts").click();
    await test.expect(attachment).toHaveText("Frame attached");
    await canvasButton.focus();
    await page.keyboard.press(shortcut);
    await test.expect(refreshes).toHaveText("1 preview refreshes");

    await q.checkbox("Attach frame shortcuts").click();
    await test.expect(attachment).toHaveText("Frame detached");
    await canvasButton.focus();
    await page.keyboard.press(shortcut);
    await test.expect(refreshes).toHaveText("1 preview refreshes");
  });

  // The visible parent control necessarily moves focus out of the frame. Use
  // its programmatic click to preserve the effect-time attachment order.
  // https://github.com/ariakit/ariakit/issues/7069
  test("replays logical scope when attaching an already-focused frame", async ({
    page,
    q,
  }) => {
    const frame = query(
      page.frameLocator('iframe[title="Live preview canvas"]'),
    );
    const refreshes = q.status("Preview refreshes");
    const attachment = q.status("Frame attachment");
    const shortcut = await getRefreshShortcut(q.button(/^Refresh preview/));

    await frame.button("Select hero card").focus();
    await q.checkbox("Attach frame shortcuts").evaluate((element) => {
      (element as HTMLInputElement).click();
    });
    await test.expect(attachment).toHaveText("Frame attached");
    await page.keyboard.press(shortcut);
    await test.expect(refreshes).toHaveText("1 preview refreshes");
  });

  // The textbox must be checked against constructors from its real iframe
  // realm, which happy-dom does not reproduce.
  // https://github.com/ariakit/ariakit/issues/7069
  test("guards a textbox from the frame's own realm", async ({ page, q }) => {
    const frame = query(
      page.frameLocator('iframe[title="Live preview canvas"]'),
    );
    const refreshes = q.status("Preview refreshes");
    const shortcut = await getRefreshShortcut(q.button(/^Refresh preview/));

    await q.checkbox("Attach frame shortcuts").click();
    await test
      .expect(q.status("Frame attachment"))
      .toHaveText("Frame attached");
    await frame.textbox("Preview title").focus();
    await page.keyboard.press(shortcut);
    await test.expect(refreshes).toHaveText("0 preview refreshes");

    await frame.button("Select hero card").focus();
    await page.keyboard.press(shortcut);
    await test.expect(refreshes).toHaveText("1 preview refreshes");
  });

  // Retargeting hides the internal control at the document boundary. The
  // command must read the first composed-path element instead.
  // https://github.com/ariakit/ariakit/issues/7069
  test("uses the composed-path origin inside an open shadow root", async ({
    page,
    q,
  }) => {
    const refreshes = q.status("Preview refreshes");
    const command = q.button(/^Refresh from shadow root/);
    const textbox = q.textbox("Shadow note");
    const shortcut = await getRefreshShortcut(q.button(/^Refresh preview/));

    await test.expect(command).toHaveAccessibleName("Refresh from shadow root");
    await test.expect(command).toContainText("P");
    await command.focus();
    await page.keyboard.press(shortcut);
    await test.expect(refreshes).toHaveText("1 preview refreshes");

    await textbox.focus();
    await page.keyboard.press(shortcut);
    await test.expect(refreshes).toHaveText("1 preview refreshes");
  });

  // Slot assignment is only modeled by a real browser. The command reference
  // must follow its assigned slot into the inert shadow wrapper.
  // https://github.com/ariakit/ariakit/issues/7069
  test("blocks a slotted reference inside an inert shadow wrapper", async ({
    page,
    q,
  }) => {
    const reference = q.button("Slotted reference");
    const hint = reference.locator(":scope > kbd");
    const inert = q.checkbox("Inert reference");
    const activations = q.status("Slotted reference activations");

    await test.expect(reference).toHaveAttribute("aria-keyshortcuts", "F7");
    await test.expect(inert).not.toBeChecked();
    await q.button("Publish").focus();
    await page.keyboard.press("F7");
    await test.expect(activations).toHaveText("1 reference activations");

    await inert.click();
    await test.expect(inert).toBeChecked();
    await test.expect(reference).not.toHaveAttribute("aria-keyshortcuts");
    await test.expect(hint).toBeHidden();
    await q.button("Publish").focus();
    await page.keyboard.press("F7");
    await test.expect(activations).toHaveText("1 reference activations");

    await inert.click();
    await test.expect(inert).not.toBeChecked();
    await test.expect(reference).toHaveAttribute("aria-keyshortcuts", "F7");
    await test.expect(hint).toBeVisible();
  });

  // Slot assignment is only modeled by a real browser. A raw scope wrapper in
  // the shadow tree must contain its slotted light-DOM focus origin.
  // https://github.com/ariakit/ariakit/issues/7069
  test("matches a raw scope through its assigned slot", async ({ page, q }) => {
    const target = q.button("Slotted scope target");
    const activations = q.status("Slotted scope activations");

    await target.focus();
    await page.keyboard.press("F8");
    await test.expect(activations).toHaveText("1 scope activations");

    await q.button("Publish").focus();
    await page.keyboard.press("F8");
    await test.expect(activations).toHaveText("1 scope activations");
  });

  // https://github.com/ariakit/ariakit/issues/7069
  test("shows the connected preview studio @visual", async ({ q, visual }) => {
    await q.checkbox("Attach frame shortcuts").click();
    await test
      .expect(q.status("Frame attachment"))
      .toHaveText("Frame attached");
    await visual({
      viewports: { desktop: { height: 800, width: 1280 } },
    });
  });
});
