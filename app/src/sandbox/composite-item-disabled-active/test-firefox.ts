import { withFramework } from "#app/test-utils/preview.ts";

// Firefox is the only desktop engine that fires focusout when the window loses
// focus while the element still holds DOM focus. Releasing the item then would
// apply the native disabled attribute to the focused element and drop focus to
// the body once the window comes back.
withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/7359
  test("keeps the item accessible across a window focus change", async ({
    context,
    page,
    q,
  }) => {
    const markAsRead = q.button("Roving mark as read");

    await q.button("Roving reply").click();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Enter");
    await test.expect(markAsRead).toHaveAttribute("aria-disabled", "true");
    await test.expect(markAsRead).toBeFocused();

    // Take window focus away with a real popup, then give it back.
    const [popup] = await Promise.all([
      context.waitForEvent("page"),
      page.evaluate(() => {
        window.open("about:blank", "_blank", "width=200,height=200");
      }),
    ]);
    await popup.bringToFront();
    // The popup has to actually take window focus before it is closed,
    // otherwise the page never loses it and the focusout below never fires.
    // Nothing on the page tracks the window's focus, so no assertion can carry
    // either of these waits.
    await page.waitForTimeout(500);
    await popup.close();
    await page.bringToFront();
    // Firefox delivers the window focusout only once the page is fronted
    // again, and the release it would trigger commits on the following render.
    await page.waitForTimeout(500);

    await test.expect(markAsRead).not.toHaveAttribute("disabled");
    await test.expect(markAsRead).toBeFocused();

    // Arrow navigation still works, which is the behavior the user would lose.
    await page.keyboard.press("ArrowRight");
    await test.expect(q.button("Roving archive")).toBeFocused();
  });
});
