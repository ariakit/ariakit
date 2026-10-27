import type { Locator } from "@playwright/test";
import { isPreviewHydrated } from "#app/lib/preview-hydration.ts";
import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

// Returns the names of the links whose rows the thumb covers but whose headings
// start below the scroll viewport, and how many rows the thumb covers.
function getHiddenThumbLinks(dialog: Locator) {
  return dialog.evaluate((element) => {
    const nav = element.querySelector("nav");
    const viewport = element.firstElementChild;
    if (!nav) return null;
    if (!viewport) return null;
    const style = getComputedStyle(nav);
    const start = Number.parseFloat(
      style.getPropertyValue("--toc-thumb-start"),
    );
    const end = Number.parseFloat(style.getPropertyValue("--toc-thumb-end"));
    const bottom = viewport.getBoundingClientRect().bottom;
    let covered = 0;
    const hidden: string[] = [];
    for (const link of nav.querySelectorAll("a")) {
      const thumb = link.querySelector<HTMLElement>(".toc-link-thumb");
      if (!thumb) continue;
      const top = Number.parseFloat(
        thumb.style.getPropertyValue("--toc-piece-top"),
      );
      if (Math.min(end, top + thumb.offsetHeight) - Math.max(start, top) <= 1) {
        continue;
      }
      covered++;
      const heading = document.getElementById(link.hash.slice(1));
      if (heading && heading.getBoundingClientRect().top >= bottom) {
        hidden.push(link.textContent ?? "");
      }
    }
    return { covered, hidden };
  });
}

withFramework(import.meta.dirname, async ({ test, query }) => {
  test("follows the scroll container of the dialog", async ({ q }) => {
    await q.button("Read the terms").click();
    const dialog = query(q.dialog("Terms of service"));
    const nav = query(dialog.navigation("Sections"));
    await nav.link("Payments").click();
    await test
      .expect(nav.link("Payments"))
      .toHaveAttribute("aria-current", "location");
    // The last section is too short to reach the top. At the end of the scroll
    // container, the activation line has slid down past it.
    await dialog.heading("Changes to these terms").evaluate((element) => {
      element.scrollIntoView({ block: "start" });
    });
    await test
      .expect(nav.link("Changes to these terms"))
      .toHaveAttribute("aria-current", "location");
  });

  test("covers only the sections on screen once the dialog opens", async ({
    page,
    q,
  }) => {
    // At this height, a heading starts just below the scroll viewport. The
    // dialog opens from a smaller scale, which moves the heading up until the
    // animation ends.
    await page.setViewportSize({ width: 1100, height: 620 });
    await q.button("Read the terms").click();
    const dialog = q.dialog("Terms of service");
    await test.expect
      .poll(() => dialog.evaluate((element) => element.getAnimations().length))
      .toBe(0);
    const rows = await getHiddenThumbLinks(dialog);
    test.expect(rows?.covered).toBeGreaterThan(0);
    test.expect(rows?.hidden).toEqual([]);
  });

  test("keeps the label below the header at the end of the terms", async ({
    q,
  }) => {
    await q.button("Read the terms").click();
    const dialog = query(q.dialog("Terms of service"));
    const nav = query(dialog.navigation("Sections"));
    const label = nav.text("Sections");
    await dialog.heading("Changes to these terms").evaluate((element) => {
      element.scrollIntoView({ block: "start", behavior: "instant" });
    });
    await test
      .expect(nav.link("Changes to these terms"))
      .toHaveAttribute("aria-current", "location");
    // The sidebar fits the scroll viewport of the dialog, so the end of the
    // terms doesn't push it up under the sticky header.
    const header = await dialog
      .heading("Terms of service")
      .evaluate(
        (element) => element.closest("header")?.getBoundingClientRect().bottom,
      );
    const top = await label.evaluate(
      (element) => element.getBoundingClientRect().top,
    );
    test.expect(top).toBeGreaterThanOrEqual(header ?? Number.NaN);
  });

  test("opens without resize loop errors", async ({ page, q }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") {
        errors.push(message.text());
      }
    });
    // A resize loop reaches only the error listeners of the window, without a
    // console message, so the page logs it.
    await page.addInitScript(() => {
      window.addEventListener("error", (event) => {
        console.error(event.message);
      });
    });
    await page.reload();
    await page.waitForFunction(isPreviewHydrated);
    // The table of contents of the closed dialog finds its scroll container
    // when the dialog opens, and observes the new content then.
    await q.button("Read the terms").click();
    const nav = query(q.dialog("Terms of service")).navigation("Sections");
    await test.expect(nav).toBeVisible();
    // Resize observers report a loop in the frame after a change, and no state
    // marks that frame.
    await flushFrames(page);
    await page.setViewportSize({ width: 900, height: 600 });
    // The same frame boundary, after the window resizes.
    await flushFrames(page);
    test.expect(errors).toEqual([]);
  });
});
