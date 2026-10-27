import type { Locator, Page } from "@playwright/test";
import { isPreviewHydrated } from "#app/lib/preview-hydration.ts";
import { withFramework } from "#app/test-utils/preview.ts";

// Returns the names of the links whose rows the thumb covers. A row counts when
// the thumb range covers more than one pixel of the line along it, which ends
// the same distance from both edges of the row.
function getThumbLinks(nav: Locator) {
  return nav.evaluate((element) => {
    const style = getComputedStyle(element);
    const start = Number.parseFloat(
      style.getPropertyValue("--toc-thumb-start"),
    );
    const end = Number.parseFloat(style.getPropertyValue("--toc-thumb-end"));
    return [...element.querySelectorAll("a")].flatMap((link) => {
      const thumb = link.querySelector<HTMLElement>(".toc-link-thumb");
      if (!thumb) return [];
      const top = Number.parseFloat(
        thumb.style.getPropertyValue("--toc-piece-top"),
      );
      // Rects include the CSS zoom of the page, unlike the lengths of the
      // pieces.
      const zoom = link.currentCSSZoom || 1;
      const linkRect = link.getBoundingClientRect();
      const thumbRect = thumb.getBoundingClientRect();
      const joint = (linkRect.bottom - thumbRect.bottom) / zoom;
      const lineBottom = top + thumb.offsetHeight;
      const lineTop = lineBottom - (linkRect.height / zoom - 2 * joint);
      const covered = Math.min(end, lineBottom) - Math.max(start, lineTop);
      return covered > 1 ? [link.textContent] : [];
    });
  });
}

const sections = [
  "Overview",
  "Installation",
  "Usage",
  "Basic example",
  "Controlled state",
  "Styling",
];

// Returns the sections from the given one to the last heading that starts above
// the bottom of the viewport.
async function getSectionsOnScreen(page: Page, from: string) {
  const last = await page.evaluate(() => {
    const headings = [...document.querySelectorAll("main :is(h2, h3)")];
    return headings.findLast((heading) => {
      return heading.getBoundingClientRect().top < window.innerHeight;
    })?.textContent;
  });
  return sections.slice(
    sections.indexOf(from),
    sections.indexOf(last ?? "") + 1,
  );
}

withFramework(import.meta.dirname, async ({ test, query }) => {
  // A short viewport lets every heading but the last ones scroll up to the
  // activation line, so clicks don't end on a later section.
  test.use({ viewport: { width: 1280, height: 480 } });

  test("marks every section current in order while the page scrolls", async ({
    q,
  }) => {
    const nav = q.navigation("On this page");
    // Scroll in small steps, as a wheel does, and read the current link after
    // the frame that updates it.
    const seen = await nav.evaluate(async (element) => {
      const names: string[] = [];
      const root = document.documentElement;
      const max = root.scrollHeight - root.clientHeight;
      for (let top = 0; top <= max + 8; top += 8) {
        window.scrollTo(0, top);
        await new Promise(requestAnimationFrame);
        await new Promise(requestAnimationFrame);
        const name = element.querySelector("[aria-current]")?.textContent;
        if (name && names.at(-1) !== name) {
          names.push(name);
        }
      }
      return names;
    });
    // The short final sections become current in turn as the activation line
    // slides down at the end of the page.
    test.expect(seen).toEqual(sections);
    await test
      .expect(query(nav).link("Styling"))
      .toHaveAttribute("aria-current", "location");
  });

  test("covers the rows of the sections on screen with the thumb", async ({
    page,
    q,
  }) => {
    const nav = q.navigation("On this page");
    await query(nav).link("Usage").click();
    await test
      .expect(query(nav).link("Usage"))
      .toHaveAttribute("aria-current", "location");
    // The run of visible rows starts at the current row and ends at the last
    // heading above the bottom of the viewport.
    const expected = await getSectionsOnScreen(page, "Usage");
    test.expect(expected.length).toBeGreaterThan(1);
    await test.expect.poll(() => getThumbLinks(nav)).toEqual(expected);
  });

  test("follows the page of a site that zooms its root element", async ({
    page,
    q,
  }) => {
    // A site can scale its UI with a zoom on the root element, which also
    // scales the scroll padding that keeps room for a sticky header there.
    await page.addStyleTag({
      content: "html { zoom: 1.5; scroll-padding-top: 16px; }",
    });
    // In a short window, the second heading is on screen at the top without the
    // zoom.
    await page.setViewportSize({ width: 1280, height: 320 });
    const nav = q.navigation("On this page");
    // At the top, the zoom pushes the second heading below the viewport.
    const top = await getSectionsOnScreen(page, "Overview");
    test.expect(top).toEqual(["Overview"]);
    await test.expect.poll(() => getThumbLinks(nav)).toEqual(top);
    await query(nav).link("Installation").click();
    await test
      .expect(query(nav).link("Installation"))
      .toHaveAttribute("aria-current", "location");
    const expected = await getSectionsOnScreen(page, "Installation");
    await test.expect.poll(() => getThumbLinks(nav)).toEqual(expected);
  });

  test("keeps the thumb still with reduced motion", async ({ page, q }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const nav = q.navigation("On this page");
    await test.expect(nav).toHaveCSS("transition-property", "none");
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await test.expect(nav).not.toHaveCSS("transition-property", "none");
  });

  test("lets the next Tab reach the link of a clicked heading", async ({
    page,
    q,
  }) => {
    const nav = query(q.navigation("On this page"));
    const heading = q.heading("Usage");
    await nav.link("Usage").click();
    await test
      .expect(nav.link("Usage"))
      .toHaveAttribute("aria-current", "location");
    // The browser moves the focus starting point to the heading, and the table
    // of contents moves no focus. The first control from there is the link that
    // the heading wraps, then the controls of the nested sections.
    await test.expect(nav.link("Usage")).not.toBeFocused();
    await page.keyboard.press("Tab");
    await test.expect(query(heading).link("Usage")).toBeFocused();
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await test.expect(q.link("combobox component page")).toBeFocused();
    await test.expect(heading).not.toHaveAttribute("tabindex");
  });

  test("lets the next Tab reach the link of a heading reached with Enter", async ({
    page,
    q,
  }) => {
    const nav = query(q.navigation("On this page"));
    await nav.link("Usage").focus();
    await page.keyboard.press("Enter");
    await test
      .expect(nav.link("Usage"))
      .toHaveAttribute("aria-current", "location");
    await page.keyboard.press("Tab");
    await test.expect(query(q.heading("Usage")).link("Usage")).toBeFocused();
  });

  test("marks the section of the hash on load", async ({ page, q }) => {
    // A section far from the end, where the activation line hasn't slid down.
    // Leaving the page first makes the hash a new load, not a scroll.
    const url = page.url();
    await page.goto("about:blank");
    await page.goto(`${url}#installation`, { waitUntil: "load" });
    await page.waitForFunction(isPreviewHydrated);
    const nav = query(q.navigation("On this page"));
    await test
      .expect(nav.link("Installation"))
      .toHaveAttribute("aria-current", "location");
    await test.expect(nav.link("Overview")).not.toHaveAttribute("aria-current");
  });
});
