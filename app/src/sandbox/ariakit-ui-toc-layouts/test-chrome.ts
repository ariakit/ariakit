import type { Locator } from "@playwright/test";
import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

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
      const linkRect = link.getBoundingClientRect();
      const joint = linkRect.bottom - thumb.getBoundingClientRect().bottom;
      const lineBottom = top + thumb.offsetHeight;
      const lineTop = lineBottom - (linkRect.height - 2 * joint);
      const covered = Math.min(end, lineBottom) - Math.max(start, lineTop);
      return covered > 1 ? [link.textContent] : [];
    });
  });
}

// Tells whether the link shows in full in the list that scrolls it.
function isInList(link: Locator) {
  return link.evaluate((element) => {
    const box = element.closest("ul");
    if (!box) return false;
    const boxRect = box.getBoundingClientRect();
    const rect = element.getBoundingClientRect();
    return rect.top >= boxRect.top - 1 && rect.bottom <= boxRect.bottom + 1;
  });
}

withFramework(import.meta.dirname, async ({ test, query }) => {
  test("glides the thumb as one bar through every piece", async ({ q }) => {
    // Jump from the top to the end, so the range moves far, then pause the
    // glide at several times, as a frame-by-frame review does.
    const frames = await q.navigation("Five levels").evaluate(async (nav) => {
      document.getElementById("deep-faq")?.scrollIntoView({ block: "start" });
      while (!nav.getAnimations().length) {
        await new Promise(requestAnimationFrame);
      }
      const animations = nav.getAnimations();
      for (const animation of animations) {
        animation.pause();
      }
      const read = (target: Element) => {
        const style = getComputedStyle(target);
        return [
          style.getPropertyValue("--toc-thumb-start"),
          style.getPropertyValue("--toc-thumb-end"),
        ].join(" ");
      };
      return [0, 40, 80, 120, 160].map((time) => {
        for (const animation of animations) {
          animation.currentTime = time;
        }
        const thumbs = [...nav.querySelectorAll(".toc-link-thumb")];
        return {
          animations: animations.length,
          range: read(nav),
          pieces: [...new Set(thumbs.map(read))],
        };
      });
    });
    test.expect(frames).toHaveLength(5);
    for (const frame of frames) {
      test.expect(frame.animations).toBeGreaterThan(0);
      // Every piece reads the same animated range, so no piece moves ahead of
      // the others and splits the thumb.
      test.expect(frame.pieces).toEqual([frame.range]);
    }
    test.expect(frames[0]?.range).not.toBe(frames[4]?.range);
  });

  test("keeps the current link in view in rows that scroll by themselves", async ({
    page,
    q,
  }) => {
    const link = query(q.navigation("Scrolling rows")).link("Chapter 12");
    await page.evaluate(() => {
      document.getElementById("chapter-12")?.scrollIntoView({ block: "start" });
    });
    await test.expect(link).toHaveAttribute("aria-current", "location");
    await test.expect.poll(() => isInList(link)).toBe(true);
  });

  test("keeps the current link in view when the rows on screen don't fit", async ({
    page,
    q,
  }) => {
    const nav = query(q.navigation("Scrolling rows"));
    const current = nav.link("Chapter 6");
    const next = nav.link("Chapter 7");
    await page.evaluate(() => {
      document.getElementById("chapter-6")?.scrollIntoView({ block: "start" });
    });
    await test.expect(current).toHaveAttribute("aria-current", "location");
    // The rows of both sections on screen don't fit in the box, so the box
    // shows the current link rather than the end of the range.
    await test.expect.poll(() => isInList(current)).toBe(true);
    test.expect(await isInList(next)).toBe(false);
  });

  test("scrolls back to the first link below a sticky label", async ({
    page,
    q,
  }) => {
    const nav = q.navigation("Sticky label");
    const first = query(nav).link("Chapter 1");
    const last = query(nav).link("Chapter 12");
    const scrollTo = (id: string) =>
      page.evaluate((id) => {
        document.getElementById(id)?.scrollIntoView({ block: "start" });
      }, id);
    await scrollTo("chapter-12");
    await test.expect(last).toHaveAttribute("aria-current", "location");
    await test.expect(first).not.toBeInViewport();
    await scrollTo("chapter-1");
    await test.expect(first).toHaveAttribute("aria-current", "location");
    // The first link shows in full below the label, not behind it.
    await test.expect
      .poll(() =>
        nav.evaluate((element) => {
          const label = element.firstElementChild;
          const link = element.querySelector("a");
          if (!label) return false;
          if (!link) return false;
          const box = element.getBoundingClientRect();
          const rect = link.getBoundingClientRect();
          const labelBottom = label.getBoundingClientRect().bottom;
          return rect.top >= labelBottom - 1 && rect.bottom <= box.bottom;
        }),
      )
      .toBe(true);
  });

  test("leaves a box alone when no link has a heading", async ({ page, q }) => {
    const box = q.region("Box with missing targets");
    await test.expect(q.navigation("Missing targets")).toBeAttached();
    // The table of contents updates in the frames after it mounts, and no state
    // marks them.
    await flushFrames(page);
    test.expect(await box.evaluate((element) => element.scrollTop)).toBe(0);
  });

  test("brings the rows on screen into view when it shows", async ({
    page,
    q,
  }) => {
    await page.evaluate(() => {
      document.getElementById("chapter-10")?.scrollIntoView({ block: "start" });
    });
    await q.button("Show chapters").click();
    const link = query(q.navigation("Chapters shown later")).link("Chapter 10");
    await test.expect(link).toHaveAttribute("aria-current", "location");
    await test.expect.poll(() => isInList(link)).toBe(true);
  });

  test("skips links to missing, hidden, and repeated headings", async ({
    q,
  }) => {
    const article = q.article("Article");
    const nav = q.navigation("Uneven targets");
    // Scroll in small steps, as a wheel does, and read the current link after
    // the frame that updates it.
    const seen = await nav.evaluate(async (element) => {
      const scroller = document.querySelector("article");
      const names: string[] = [];
      if (!scroller) {
        return names;
      }
      const end = document.getElementById("deep-faq")?.offsetTop ?? 0;
      for (let top = 0; top <= end; top += 8) {
        scroller.scrollTop = top;
        await new Promise(requestAnimationFrame);
        await new Promise(requestAnimationFrame);
        const name = element.querySelector("[aria-current]")?.textContent;
        if (name && names.at(-1) !== name) {
          names.push(name);
        }
      }
      return names;
    });
    test.expect(seen).toEqual(["Overview", "Guides", "FAQ"]);
    await test.expect(article).toBeVisible();
    await test
      .expect(query(nav).link("FAQ"))
      .toHaveAttribute("aria-current", "location");
  });

  test("skips headings in hidden content that keeps its boxes", async ({
    page,
    q,
  }) => {
    const nav = query(q.navigation("Collapsed section"));
    // A panel that the visibility property hides, and closed details.
    for (const id of ["collapsed-hidden", "collapsed-details"]) {
      await q.heading("After").evaluate((element) => {
        element.scrollIntoView({ block: "start" });
      });
      await test
        .expect(nav.link("After"))
        .toHaveAttribute("aria-current", "location");
      // The hidden heading reaches the activation line while the next heading
      // is still below it, so the section before it stays current. A heading in
      // closed details doesn't scroll into view, so the article scrolls it to
      // the scroll padding, as a wheel would.
      await page.evaluate((id) => {
        const heading = document.getElementById(id);
        const article = heading?.closest("article");
        if (!heading) return;
        if (!article) return;
        const top = article.getBoundingClientRect().top + article.clientTop;
        const padding = getComputedStyle(article).scrollPaddingTop;
        const offset = heading.getBoundingClientRect().top - top;
        article.scrollTop += offset - Number.parseFloat(padding);
      }, id);
      await test
        .expect(nav.link("Before"))
        .toHaveAttribute("aria-current", "location");
    }
  });

  test("keeps the first of the headings side by side current", async ({
    page,
    q,
  }) => {
    const nav = query(q.navigation("Side by side"));
    // A link to the second heading of a row makes it current.
    await nav.link("Dates").click();
    await test
      .expect(nav.link("Dates"))
      .toHaveAttribute("aria-current", "location");
    // The thumb covers both headings of the row. A heading beside the first one
    // doesn't end its section.
    await test.expect
      .poll(() => getThumbLinks(q.navigation("Side by side")))
      .toEqual(test.expect.arrayContaining(["Cherries", "Dates"]));
    // Scrolling on starts from that heading, without going back to the first
    // one of its row. Read the current link after the frame that updates it.
    const seen = await q.navigation("Side by side").evaluate(async (nav) => {
      const article = document.getElementById("side-dates")?.closest("article");
      const names: string[] = [];
      if (!article) return names;
      const end = article.scrollTop + 160;
      for (let top = article.scrollTop; top <= end; top += 8) {
        article.scrollTop = top;
        await new Promise(requestAnimationFrame);
        await new Promise(requestAnimationFrame);
        const name = nav.querySelector("[aria-current]")?.textContent;
        if (name && names.at(-1) !== name) {
          names.push(name);
        }
      }
      return names;
    });
    test.expect(seen).toEqual(["Dates", "Figs"]);
    // Without a link to a heading of the row, the first one is current.
    await page.evaluate(() => {
      history.replaceState(null, "", location.pathname);
    });
    await q.heading("Cherries").evaluate((element) => {
      element.scrollIntoView({ block: "start" });
    });
    await test
      .expect(nav.link("Cherries"))
      .toHaveAttribute("aria-current", "location");
  });

  test("follows the headings of a zoomed article", async ({ q }) => {
    const link = query(q.navigation("Zoomed parts")).link("Part 3");
    await q.heading("Part 3").evaluate((element) => {
      element.scrollIntoView({ block: "start" });
    });
    await test.expect(link).toHaveAttribute("aria-current", "location");
  });

  test("keeps the current link in view in zoomed rows", async ({ q }) => {
    const link = query(q.navigation("Zoomed parts")).link("Part 6");
    await q.heading("Part 6").evaluate((element) => {
      element.scrollIntoView({ block: "start" });
    });
    await test.expect(link).toHaveAttribute("aria-current", "location");
    await test.expect.poll(() => isInList(link)).toBe(true);
  });

  test("follows content that grows in a panel without a scroll", async ({
    q,
  }) => {
    const nav = q.navigation("Steps");
    // Every step fits in the panel, which doesn't scroll, so the page is the
    // scroll container until the details show.
    await q.article("Steps").scrollIntoViewIfNeeded();
    await test.expect
      .poll(() => getThumbLinks(nav))
      .toEqual(["First step", "Second step", "Third step"]);
    // The details push the later steps out of the panel, and the panel starts
    // to scroll.
    await q.button("Show details").click();
    await test.expect
      .poll(() => getThumbLinks(nav))
      .not.toContain("Third step");
    // The last step can't reach the top. At the end of the panel, the
    // activation line has slid down past it.
    await q.heading("Third step").evaluate((element) => {
      element.scrollIntoView({ block: "start" });
    });
    await test
      .expect(query(nav).link("Third step"))
      .toHaveAttribute("aria-current", "location");
    await test.expect.poll(() => getThumbLinks(nav)).toContain("Third step");
  });
});
