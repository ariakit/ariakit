import { invariant } from "@ariakit/utils";
import type { Locator, Page } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

// The default hide timeout. Nothing shows a pending hide.
const hideTimeout = 500;

// Moves the mouse to the bottom-right corner of the page, away from the anchors
// and the hovercards.
async function moveAway(page: Page) {
  const viewport = page.viewportSize();
  invariant(viewport, "The page has no viewport size.");
  await page.mouse.move(viewport.width - 10, viewport.height - 10, {
    steps: 10,
  });
}

withFramework(import.meta.dirname, async ({ test }) => {
  const openHovercard = async (anchor: Locator, card: Locator) => {
    await anchor.scrollIntoViewIfNeeded();
    await anchor.hover();
    await test.expect(card).toHaveAttribute("data-open");
  };

  // https://github.com/ariakit/ariakit/issues/8366
  test("keep the hovercard in a shadow root open on mouse leave while focus is inside it", async ({
    page,
    q,
  }) => {
    const card = q.dialog("Profile");
    await openHovercard(q.link("Profile"), card);
    await q.button("Follow").click();
    await test.expect(q.button("Follow")).toBeFocused();
    await test.expect(card).toHaveAttribute("data-open");

    await moveAway(page);
    // Wait past the hide timeout to see that no hide runs.
    await page.waitForTimeout(hideTimeout + 100);

    await test.expect(card).toHaveAttribute("data-open");
    await test.expect(q.button("Follow")).toBeFocused();
  });

  // https://github.com/ariakit/ariakit/issues/8366
  test("keep a nested hovercard in a shadow root open on mouse leave while focus is inside it", async ({
    page,
    q,
  }) => {
    const team = q.dialog("Team");
    const member = q.dialog("Member");
    await openHovercard(q.link("Team"), team);
    await openHovercard(q.link("Member"), member);
    await q.button("Message").click();
    await test.expect(q.button("Message")).toBeFocused();
    await test.expect(team).toHaveAttribute("data-open");
    await test.expect(member).toHaveAttribute("data-open");

    await moveAway(page);
    // Wait past the hide timeout to see that no hide runs.
    await page.waitForTimeout(hideTimeout + 100);

    await test.expect(team).toHaveAttribute("data-open");
    await test.expect(member).toHaveAttribute("data-open");
    await test.expect(q.button("Message")).toBeFocused();
  });

  // https://github.com/ariakit/ariakit/issues/8366
  test("hide the hovercard in a shadow root on mouse leave without focus inside it", async ({
    page,
    q,
  }) => {
    const card = q.dialog("Profile");
    await openHovercard(q.link("Profile"), card);
    await q.button("Follow").hover();

    await moveAway(page);

    await test.expect(card).not.toBeVisible();
  });

  // https://github.com/ariakit/ariakit/issues/8366
  test("hide the nested hovercards in a shadow root on mouse leave without focus inside them", async ({
    page,
    q,
  }) => {
    const team = q.dialog("Team");
    const member = q.dialog("Member");
    await openHovercard(q.link("Team"), team);
    await openHovercard(q.link("Member"), member);
    await q.button("Message").hover();

    await moveAway(page);

    await test.expect(member).not.toBeVisible();
    await test.expect(team).not.toBeVisible();
  });
});
