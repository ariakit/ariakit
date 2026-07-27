import { withFramework } from "#app/test-utils/preview.ts";

const labels = [
  "default",
  "portal",
  "modal",
  "unmount portal",
  "unmount modal",
] as const;

const nonModalLabels = labels.filter((label) => !label.includes("modal"));

withFramework(import.meta.dirname, async ({ test }) => {
  for (const label of labels) {
    test(`${label}: hover shows and outside pointer hides its tooltip`, async ({
      page,
      q,
    }) => {
      await q.button(label).hover();
      await test.expect(q.tooltip(label)).toBeVisible();
      await page.mouse.move(4, 4);
      await test.expect(q.tooltip(label)).not.toBeVisible();
    });

    test(`${label}: opening the menu hides its tooltip`, async ({ q }) => {
      await q.button(label).hover();
      await test.expect(q.tooltip(label)).toBeVisible();
      await q.button(label).click();
      await test.expect(q.menu(label)).toBeVisible();
      await test.expect(q.menu(label)).toBeFocused();
      await test.expect(q.tooltip(label)).not.toBeVisible();
    });

    test(`${label}: moving inside the disclosure after opening does not reshow its tooltip`, async ({
      q,
    }) => {
      const button = q.button(label);
      await button.hover();
      await test.expect(q.tooltip(label)).toBeVisible();
      await button.click();
      await test.expect(q.menu(label)).toBeVisible();
      await test.expect(q.tooltip(label)).not.toBeVisible();
      const hiddenButton = q.button(label, { includeHidden: true });
      await hiddenButton.hover({ force: true });
      await hiddenButton.hover({ force: true });
      await test.expect(q.tooltip(label)).not.toBeVisible();
    });

    test(`${label}: re-entering after an outside move respects modality`, async ({
      page,
      q,
    }) => {
      const button = q.button(label);
      await button.hover();
      await test.expect(q.tooltip(label)).toBeVisible();
      await button.click();
      await test.expect(q.tooltip(label)).not.toBeVisible();
      await page.mouse.move(4, 4);
      const hiddenButton = q.button(label, { includeHidden: true });
      await hiddenButton.hover({ force: true });
      await hiddenButton.hover({ force: true });
      if (label.includes("modal")) {
        await test.expect(q.tooltip(label)).not.toBeVisible();
      } else {
        await test.expect(q.tooltip(label)).toBeVisible();
      }
    });

    test(`${label}: Escape closes the menu and shows the focused disclosure tooltip`, async ({
      page,
      q,
    }) => {
      await q.button(label).click();
      await test.expect(q.menu(label)).toBeVisible();
      await page.keyboard.press("Escape");
      await test.expect(q.menu(label)).not.toBeVisible();
      await test.expect(q.tooltip(label)).toBeVisible();
    });
  }

  for (const label of nonModalLabels) {
    test(`${label}: reopening the menu closes a visible tooltip`, async ({
      page,
      q,
    }) => {
      const button = q.button(label);
      await button.hover();
      await test.expect(q.tooltip(label)).toBeVisible();
      await button.click();
      await test.expect(q.tooltip(label)).not.toBeVisible();
      await page.mouse.move(4, 4);
      await button.hover();
      await test.expect(q.tooltip(label)).toBeVisible();
      await button.click();
      await button.click();
      await test.expect(q.menu(label)).toBeVisible();
      await test.expect(q.tooltip(label)).not.toBeVisible();
    });

    test(`${label}: opening during the timeout suppresses the tooltip until re-entry`, async ({
      page,
      q,
    }) => {
      await q.textbox("Timeout").fill("200");
      await test.expect(q.textbox("Timeout")).toHaveValue("200");
      const button = q.button(label);
      await button.hover();
      await test.expect(q.tooltip(label)).not.toBeVisible();
      await button.click();
      await test.expect(q.menu(label)).toBeVisible();
      await button.hover({
        force: true,
        position: { x: 10, y: 10 },
      });
      await page.waitForTimeout(200);
      await test.expect(q.tooltip(label)).not.toBeVisible();
      await page.mouse.move(4, 4);
      await button.hover();
      await test.expect(q.tooltip(label)).not.toBeVisible();
      await test.expect(q.tooltip(label)).toBeVisible();
    });
  }

  test("composes VisuallyHidden, TooltipAnchor, and MenuButton", async ({
    page,
    q,
  }) => {
    const button = q.button("Accessibility Shortcuts");
    await test
      .expect(button.locator("span").first())
      .toHaveText("Accessibility Shortcuts");

    await button.hover();
    await test.expect(q.tooltip("Accessibility Shortcuts")).toBeVisible();
    await page.mouse.move(4, 4);
    await test.expect(q.tooltip("Accessibility Shortcuts")).not.toBeVisible();

    await button.hover();
    await button.click();
    await test.expect(q.menu("Accessibility Shortcuts")).toBeVisible();
    await test.expect(q.menu("Accessibility Shortcuts")).toBeFocused();
    await test.expect(q.tooltip("Accessibility Shortcuts")).not.toBeVisible();
  });
});
