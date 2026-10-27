import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  test("scrolls only its own box to keep the current link in view", async ({
    page,
    q,
  }) => {
    const nav = q.navigation("Releases");
    const last = query(nav).link("Version 2.1.0");
    await test.expect(last).not.toBeInViewport();
    const end = await page.evaluate(() => {
      const root = document.documentElement;
      const top = root.scrollHeight - root.clientHeight;
      window.scrollTo(0, top);
      return top;
    });
    await test.expect(last).toHaveAttribute("aria-current", "location");
    // The sidebar body scrolls to the link, and the page keeps its place.
    await test.expect(last).toBeInViewport();
    await test.expect
      .poll(() =>
        last.evaluate((link) => {
          const box = link.closest(".shell-sidebar-body");
          if (!box) return false;
          const boxRect = box.getBoundingClientRect();
          const rect = link.getBoundingClientRect();
          return rect.top >= boxRect.top && rect.bottom <= boxRect.bottom;
        }),
      )
      .toBe(true);
    test.expect(await page.evaluate(() => window.scrollY)).toBe(end);
  });

  test("keeps the rows of the sections on screen in view", async ({
    page,
    q,
  }) => {
    // In a short window, the current link fits in the sidebar body, but the
    // rows of the later sections on screen end below it.
    await page.setViewportSize({ width: 1280, height: 480 });
    const nav = q.navigation("Releases");
    await q.heading("Version 2.13.0").evaluate((element) => {
      element.scrollIntoView({ block: "start" });
    });
    await test
      .expect(query(nav).link("Version 2.13.0"))
      .toHaveAttribute("aria-current", "location");
    await test.expect
      .poll(() =>
        nav.evaluate((element) => {
          const box = element.closest(".shell-sidebar-body");
          if (!box) return null;
          const boxRect = box.getBoundingClientRect();
          // The inline range is where the thumb glides to.
          const { style } = element;
          const start = Number.parseFloat(
            style.getPropertyValue("--toc-thumb-start"),
          );
          const end = Number.parseFloat(
            style.getPropertyValue("--toc-thumb-end"),
          );
          const rows = { covered: 0, outside: [] as string[] };
          for (const link of element.querySelectorAll("a")) {
            const thumb = link.querySelector<HTMLElement>(".toc-link-thumb");
            if (!thumb) continue;
            const top = Number.parseFloat(
              thumb.style.getPropertyValue("--toc-piece-top"),
            );
            const line = Math.min(end, top + thumb.offsetHeight);
            if (line - Math.max(start, top) <= 1) continue;
            rows.covered++;
            const rect = link.getBoundingClientRect();
            if (rect.top < boxRect.top || rect.bottom > boxRect.bottom + 1) {
              rows.outside.push(link.textContent ?? "");
            }
          }
          // More than one row, so the range reaches past the current link.
          return rows.covered > 1 ? rows.outside : null;
        }),
      )
      .toEqual([]);
  });

  test("shows the label again when the list goes back to its start", async ({
    page,
    q,
  }) => {
    const nav = q.navigation("Releases");
    const label = query(nav).text("Releases");
    const first = query(nav).link("Version 2.24.0");
    await page.evaluate(() => {
      const root = document.documentElement;
      window.scrollTo(0, root.scrollHeight - root.clientHeight);
    });
    await test.expect(label).not.toBeInViewport();
    // The first link is current at the top, and the list shows its start with
    // the label above it.
    await page.evaluate(() => window.scrollTo(0, 0));
    await test.expect(first).toHaveAttribute("aria-current", "location");
    await test.expect
      .poll(() =>
        label.evaluate((element) => {
          const box = element.closest(".shell-sidebar-body");
          if (!box) return false;
          const boxRect = box.getBoundingClientRect();
          const rect = element.getBoundingClientRect();
          return rect.top >= boxRect.top && rect.bottom <= boxRect.bottom;
        }),
      )
      .toBe(true);
  });
});
