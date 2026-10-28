import type { Locator, Page } from "@playwright/test";
import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

// Scrolls to the heading and pauses the thumb glides as soon as each table of
// contents sets its range. A slow frame can outlast the glide, which then
// starts and ends between two frame callbacks.
async function pauseGlides(page: Page, navs: Locator[], id: string) {
  const elements = await Promise.all(navs.map((nav) => nav.elementHandle()));
  await page.evaluate(
    ({ elements, id }) => {
      const navs = elements.filter((element) => element != null);
      return new Promise<void>((resolve) => {
        const observer = new MutationObserver(() => {
          let waiting = false;
          for (const nav of navs) {
            // Reading the animations applies the new range, which starts the
            // glide.
            const animations = nav.getAnimations({ subtree: true });
            for (const animation of animations) {
              animation.pause();
            }
            if (!animations.length) {
              waiting = true;
            }
          }
          if (waiting) return;
          observer.disconnect();
          resolve();
        });
        for (const nav of navs) {
          observer.observe(nav, { subtree: true, attributeFilter: ["style"] });
        }
        document.getElementById(id)?.scrollIntoView({ block: "start" });
      });
    },
    { elements, id },
  );
}

// Returns the names of the links whose rows the thumb covers. A row counts when
// the thumb range covers more than one pixel of the line along it, which ends
// the same distance from both edges of the row.
function getThumbLinks(nav: Locator) {
  return nav.evaluate((element) => {
    return [...element.querySelectorAll("a")].flatMap((link) => {
      const thumb = link.querySelector<HTMLElement>(".toc-link-thumb");
      if (!thumb) return [];
      // Each thumb piece holds the range that glides on it.
      const style = getComputedStyle(thumb);
      const start = Number.parseFloat(
        style.getPropertyValue("--toc-thumb-start"),
      );
      const end = Number.parseFloat(style.getPropertyValue("--toc-thumb-end"));
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
  test("glides the thumb as one bar through every piece", async ({
    page,
    q,
  }) => {
    // Jump from the top to the end, so the range moves far, then read the
    // paused glide at several times.
    const nav = q.navigation("Five levels");
    await pauseGlides(page, [nav], "deep-faq");
    const frames = await nav.evaluate((element) => {
      const animations = element.getAnimations({ subtree: true });
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
        const thumbs = [...element.querySelectorAll(".toc-link-thumb")];
        return {
          animations: animations.length,
          pieces: [...new Set(thumbs.map(read))],
        };
      });
    });
    test.expect(frames).toHaveLength(5);
    for (const frame of frames) {
      test.expect(frame.animations).toBeGreaterThan(0);
      // Every piece glides through the same range, so no piece moves ahead of
      // the others and splits the thumb.
      test.expect(frame.pieces).toHaveLength(1);
    }
    test.expect(frames[0]?.pieces).not.toEqual(frames[4]?.pieces);
  });

  // https://github.com/ariakit/ariakit/issues/8141
  test("glides the thumb on its pieces, not on the rows", async ({
    page,
    q,
  }) => {
    // A glide on the root restyles every row in each frame, so only the thumb
    // pieces and the number markers with rings animate. Read the paused glide
    // halfway to compare the range on the pieces and the rings.
    const chapters = q.navigation("Twelve chapters");
    const numbers = q.navigation("Numbers over the thumb");
    await pauseGlides(page, [chapters, numbers], "chapter-12");
    const unringed = await numbers.elementHandle();
    const glide = await chapters.evaluate((nav, other) => {
      const navs = [nav, other].filter((element) => element != null);
      const animations = navs.flatMap((element) =>
        element.getAnimations({ subtree: true }),
      );
      for (const animation of animations) {
        animation.currentTime = 100;
      }
      const getTargets = (element: Element) => {
        const targets = element
          .getAnimations({ subtree: true })
          .map((animation) => {
            const { effect } = animation;
            const target = effect instanceof KeyframeEffect && effect.target;
            if (!target) return "none";
            if (target.matches(".toc-link-thumb")) return "thumb";
            if (target.matches(".toc-link-marker")) return "marker";
            return target.tagName.toLowerCase();
          });
        return [...new Set(targets)].sort();
      };
      const read = (target: Element, pseudo?: string) => {
        const style = getComputedStyle(target, pseudo);
        return [
          style.getPropertyValue("--toc-thumb-start"),
          style.getPropertyValue("--toc-thumb-end"),
        ].join(" ");
      };
      const thumbs = [...nav.querySelectorAll(".toc-link-thumb")];
      const markers = [...nav.querySelectorAll(".toc-link-marker")];
      const rings = markers.map((marker) => read(marker, "::after"));
      return {
        targets: getTargets(nav),
        unringedTargets: other ? getTargets(other) : null,
        markers: markers.length,
        ranges: [
          ...new Set([...thumbs, ...markers].map((piece) => read(piece))),
        ],
        rings: [...new Set(rings)],
      };
    }, unringed);
    test.expect(glide.targets).toEqual(["marker", "thumb"]);
    // Markers without rings don't read the range.
    test.expect(glide.unringedTargets).toEqual(["thumb"]);
    test.expect(glide.markers).toBe(12);
    // The rings glide with the thumb.
    test.expect(glide.ranges).toHaveLength(1);
    test.expect(glide.rings).toEqual(glide.ranges);
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
    // doesn't end its section. The thumb glides through the rows above on its
    // pieces, so the range counts only once the glide ends.
    const sideNav = q.navigation("Side by side");
    await test.expect
      .poll(() =>
        sideNav.evaluate((element) => {
          return element.getAnimations({ subtree: true }).length;
        }),
      )
      .toBe(0);
    test
      .expect(await getThumbLinks(sideNav))
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
