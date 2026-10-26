import { withFramework } from "#app/test-utils/preview.ts";
import { hoverPastShowTimeout } from "#app/test-utils/tooltip.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("explains why Publish is disabled on hover", async ({ q }) => {
    const publish = q.button("Publish");
    await test.expect(publish).toHaveAttribute("aria-disabled", "true");
    await test
      .expect(publish)
      .toHaveAccessibleDescription("Add a title to publish.");
    // Ariakit resets hover intent on scroll, so the anchor must be in view
    // before the pointer moves over it.
    await publish.scrollIntoViewIfNeeded();
    await publish.hover();
    await test.expect(q.tooltip("Add a title to publish.")).toBeVisible();
  });

  test("keeps focus on the disabled button and shows the reason", async ({
    page,
    q,
  }) => {
    await q.textbox("Title").focus();
    await page.keyboard.press("Tab");
    await test.expect(q.button("Publish")).toBeFocused();
    await test.expect(q.tooltip("Add a title to publish.")).toBeVisible();
    await page.keyboard.press("Escape");
    await test.expect(q.tooltip("Add a title to publish.")).toBeHidden();
    await test.expect(q.button("Publish")).toBeFocused();
  });

  test("turns the tooltip off and publishes once there is a title", async ({
    page,
    q,
  }) => {
    await q.textbox("Title").fill("Launch notes");
    const publish = q.button("Publish");
    await test.expect(publish).not.toHaveAttribute("aria-disabled");
    await test.expect(publish).toHaveAccessibleDescription("");
    await hoverPastShowTimeout(page, publish);
    await test.expect(q.tooltip()).toHaveCount(0);
    await publish.click();
    await test.expect(q.status()).toHaveText("Published “Launch notes”.");
  });
});
