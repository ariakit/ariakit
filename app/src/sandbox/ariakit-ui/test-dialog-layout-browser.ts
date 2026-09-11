import type { Locator } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

async function getBox(locator: Locator) {
  const box = await locator.boundingBox();
  if (!box) {
    throw new Error("Element has no bounding box");
  }
  return box;
}

function isScrollable(node: Element) {
  return node.scrollHeight > node.clientHeight;
}

/**
 * Waits for the dialog to scale in, so its box has its final size.
 */
async function waitForEntry(dialog: Locator) {
  await dialog.evaluate((node) =>
    Promise.all(node.getAnimations().map((animation) => animation.finished)),
  );
}

withFramework(
  import.meta.dirname,
  { route: "dialog" },
  async ({ test, query }) => {
    test("caps the dialog height with a caller max-h class", async ({ q }) => {
      await q.button("Release notes").click();
      const dialog = q.dialog("Release notes");
      await test.expect(dialog).toBeVisible();
      await waitForEntry(dialog);
      // max-h-64 is 16rem, 256px at the page's 16px root.
      await test.expect(dialog).toHaveCSS("max-height", "256px");
      const { height } = await getBox(dialog);
      test.expect(height).toBeCloseTo(256, 0);
      const body = dialog.locator("p").first().locator("..");
      test.expect(await body.evaluate(isScrollable)).toBe(true);
      await test
        .expect(query(dialog).heading("Release notes"))
        .toBeInViewport({ ratio: 1 });
      await test.expect(query(dialog).button("Done")).toBeInViewport({
        ratio: 1,
      });
    });

    test("stops a long dialog at the viewport insets and scrolls only its body", async ({
      page,
      q,
    }) => {
      await q.button("Terms of service").click();
      const dialog = q.dialog("Terms of service");
      await test.expect(dialog).toBeVisible();
      await waitForEntry(dialog);
      const viewport = page.viewportSize();
      test.expect(viewport).not.toBeNull();
      if (!viewport) return;
      const box = await getBox(dialog);
      // The recipe keeps 12px between the dialog and each viewport edge.
      test.expect(box.y).toBeCloseTo(12, 0);
      test.expect(box.y + box.height).toBeCloseTo(viewport.height - 12, 0);
      const heading = query(dialog).heading("Terms of service");
      const agree = query(dialog).button("Agree");
      await test.expect(heading).toBeInViewport({ ratio: 1 });
      await test.expect(agree).toBeInViewport({ ratio: 1 });
      // Initial focus lands on the action after the body, and the body must not
      // scroll to reach it, so the first section stays readable.
      await test.expect(agree).toBeFocused();
      const body = dialog.locator("p").first().locator("..");
      test.expect(await body.evaluate(isScrollable)).toBe(true);
      test.expect(await body.evaluate((node) => node.scrollTop)).toBe(0);
    });

    test("renders a dismiss without children as a square icon button", async ({
      q,
    }) => {
      await q.button("Invite member").click();
      const dialog = q.dialog("Invite sent");
      const dismiss = query(dialog).button("Dismiss popup");
      await test.expect(dismiss).toBeVisible();
      await waitForEntry(dialog);
      const { width, height } = await getBox(dismiss);
      test.expect(width).toBeCloseTo(height, 0);
      // WCAG 2.2 minimum target size.
      test.expect(width).toBeGreaterThanOrEqual(24);
    });

    test("narrows the dialog with a caller max-w class and keeps it centered", async ({
      page,
      q,
    }) => {
      await q.button("Sign out").click();
      const dialog = q.dialog("Sign out?");
      await test.expect(dialog).toBeVisible();
      await waitForEntry(dialog);
      const viewport = page.viewportSize();
      test.expect(viewport).not.toBeNull();
      if (!viewport) return;
      const box = await getBox(dialog);
      // max-w-64 is 16rem, 256px at the page's 16px root.
      test.expect(box.width).toBeCloseTo(256, 0);
      test.expect(box.x + box.width / 2).toBeCloseTo(viewport.width / 2, 0);
    });

    test("stretches the default dialog to its maximum width", async ({ q }) => {
      await q.button("View receipt").click();
      const dialog = q.dialog("Success");
      await test.expect(dialog).toBeVisible();
      await waitForEntry(dialog);
      // The default maximum width is 25rem, 400px at the page's 16px root.
      const box = await getBox(dialog);
      test.expect(box.width).toBeCloseTo(400, 0);
    });
  },
);
