import type { Locator, Page } from "@playwright/test";
import { flushFrames, withFramework } from "#app/test-utils/preview.ts";
import { expectTocBarStill } from "#app/test-utils/toc.ts";

// Scrolls to the heading and pauses the bar glides as soon as each table of
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

// Returns the names of the links whose rows the bar covers. A row counts when
// the bar range covers more than one pixel of the line along it, which ends the
// same distance from both edges of the row.
function getBarLinks(nav: Locator) {
  return nav.evaluate((element) => {
    return [...element.querySelectorAll("a")].flatMap((link) => {
      const bar = link.querySelector<HTMLElement>(".ui-toc-link-bar");
      if (!bar) return [];
      // Each bar piece holds the range that glides on it.
      const style = getComputedStyle(bar);
      const start = Number.parseFloat(
        style.getPropertyValue("--nav-bar-start"),
      );
      const end = Number.parseFloat(style.getPropertyValue("--nav-bar-end"));
      const top = Number.parseFloat(
        bar.style.getPropertyValue("--nav-bar-top"),
      );
      const linkRect = link.getBoundingClientRect();
      const joint = linkRect.bottom - bar.getBoundingClientRect().bottom;
      const lineBottom = top + bar.offsetHeight;
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

// Scrolls the article from one heading to another in small steps, as a wheel
// would, and reads the scroll position of the list after each step. The list
// must move in the frame that updates it and hold still in the next frames,
// because an animation of the list runs ahead of the main thread while the page
// scrolls fast, and restarting it jumps the rows back. It must also never move
// back or jump half a row at once.
function followArticle(nav: Locator, from: string, to: string) {
  return nav.evaluate(
    async (element, { from, to }) => {
      const drifts: string[] = [];
      const backs: string[] = [];
      const jumps: string[] = [];
      const result = { steps: 0, distance: 0, drifts, backs, jumps };
      const article = document.getElementById(from)?.closest("article");
      const end = document.getElementById(to);
      const row = element.querySelector("a")?.offsetHeight ?? 0;
      if (!article) return result;
      if (!end) return result;
      const frame = () => new Promise(requestAnimationFrame);
      // The scroll position that puts the last heading at the top.
      const last =
        article.scrollTop +
        end.getBoundingClientRect().top -
        article.getBoundingClientRect().top;
      const start = element.scrollTop;
      let previous = start;
      for (let top = article.scrollTop; top <= last; top += 16) {
        article.scrollTop = top;
        // The scroll event schedules the update for the next frame.
        await frame();
        await frame();
        const moved = element.scrollTop;
        // A smooth scroll of the list would still move in these frames.
        await frame();
        await frame();
        const settled = element.scrollTop;
        const step = `${previous} -> ${moved} -> ${settled} at ${top}`;
        if (moved !== settled) {
          drifts.push(step);
        }
        if (settled < previous - 0.5) {
          backs.push(step);
        }
        if (settled - previous > row / 2) {
          jumps.push(step);
        }
        previous = settled;
        result.steps++;
      }
      result.distance = previous - start;
      return result;
    },
    { from, to },
  );
}

withFramework(import.meta.dirname, async ({ test, query }) => {
  test("glides the bar as one bar through every piece", async ({ page, q }) => {
    // Jump from the top to the end, so the range moves far, then read the
    // paused glide at several times.
    const nav = q.navigation("Five levels");
    await pauseGlides(page, [nav], "deep-faq");
    const frames = await nav.evaluate((element) => {
      const animations = element.getAnimations({ subtree: true });
      const read = (target: Element) => {
        const style = getComputedStyle(target);
        return [
          style.getPropertyValue("--nav-bar-start"),
          style.getPropertyValue("--nav-bar-end"),
        ].join(" ");
      };
      return [0, 40, 80, 120, 160].map((time) => {
        for (const animation of animations) {
          animation.currentTime = time;
        }
        const bars = [...element.querySelectorAll(".ui-toc-link-bar")];
        return {
          animations: animations.length,
          pieces: [...new Set(bars.map(read))],
        };
      });
    });
    test.expect(frames).toHaveLength(5);
    for (const frame of frames) {
      test.expect(frame.animations).toBeGreaterThan(0);
      // Every piece glides through the same range, so no piece moves ahead of
      // the others and splits the bar.
      test.expect(frame.pieces).toHaveLength(1);
    }
    test.expect(frames[0]?.pieces).not.toEqual(frames[4]?.pieces);
  });

  // https://github.com/ariakit/ariakit/issues/8141
  test("glides the bar on its pieces, not on the rows", async ({ page, q }) => {
    // A glide on the root restyles every row in each frame, so only the bar
    // pieces and the number markers with a highlight animate. Read the paused
    // glide halfway to compare the range on the pieces and the rings.
    const chapters = q.navigation("Ringed chapters");
    const numbers = q.navigation("Numbers over the bar");
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
            if (target.matches(".ui-toc-link-bar")) return "bar";
            if (target.matches(".ui-toc-link-marker")) return "marker";
            return target.tagName.toLowerCase();
          });
        return [...new Set(targets)].sort();
      };
      const read = (target: Element, pseudo?: string) => {
        const style = getComputedStyle(target, pseudo);
        return [
          style.getPropertyValue("--nav-bar-start"),
          style.getPropertyValue("--nav-bar-end"),
        ].join(" ");
      };
      const bars = [...nav.querySelectorAll(".ui-toc-link-bar")];
      const markers = [...nav.querySelectorAll(".ui-toc-link-marker")];
      const rings = markers.map((marker) => read(marker, "::after"));
      return {
        targets: getTargets(nav),
        unringedTargets: other ? getTargets(other) : null,
        markers: markers.length,
        ranges: [...new Set(bars.map((bar) => read(bar)))],
        rings: [...new Set(rings)],
      };
    }, unringed);
    test.expect(glide.targets).toEqual(["bar", "marker"]);
    // Markers without a highlight don't read the range.
    test.expect(glide.unringedTargets).toEqual(["bar"]);
    test.expect(glide.markers).toBe(12);
    // The rings glide with the bar.
    test.expect(glide.ranges).toHaveLength(1);
    test.expect(glide.rings).toEqual(glide.ranges);
  });

  test("fills the markers as the bar reaches them", async ({ page, q }) => {
    const nav = q.navigation("Twelve chapters");
    await page.evaluate(() => {
      document.getElementById("chapter-1")?.scrollIntoView({ block: "start" });
    });
    await test
      .expect(query(nav).link("Chapter 1"))
      .toHaveAttribute("aria-current", "location");
    await expectTocBarStill(page, nav);
    await pauseGlides(page, [nav], "chapter-6");
    const fill = await nav.evaluate((element) => {
      const animations = element.getAnimations({ subtree: true });
      // The height of the part of a marker that its fill shows. The clip of the
      // fill cuts it from the top and from the bottom.
      const getFillHeight = (name: string) => {
        const links = [...element.querySelectorAll("a")];
        const link = links.find((item) => item.textContent === name);
        const marker = link?.querySelector(".ui-toc-link-marker");
        if (!marker) return Number.NaN;
        const { clipPath } = getComputedStyle(marker, "::after");
        const insets = clipPath.match(/-?[\d.]+/g)?.map(Number) ?? [];
        // An inset with one or two values has the same top and bottom.
        const [top = 0, , bottom = top] = insets;
        const { height } = marker.getBoundingClientRect();
        return height - Math.max(0, top) - Math.max(0, bottom);
      };
      const read = (time: number) => {
        for (const animation of animations) {
          animation.currentTime = time;
        }
        return {
          left: getFillHeight("Chapter 1"),
          reached: getFillHeight("Chapter 6"),
          past: getFillHeight("Chapter 12"),
        };
      };
      return { start: read(0), end: read(199) };
    });
    // The fill follows the range. The marker that the bar leaves is full when
    // the glide starts and empty when it ends, the marker that the bar reaches
    // is empty when the glide starts and full when it ends, and a marker past
    // the bar stays empty.
    test.expect(fill.start.left).toBeGreaterThan(0);
    test.expect(fill.end.left).toBeLessThanOrEqual(0);
    test.expect(fill.start.reached).toBeLessThanOrEqual(0);
    test.expect(fill.end.reached).toBeGreaterThan(0);
    test.expect(fill.start.past).toBeLessThanOrEqual(0);
    test.expect(fill.end.past).toBeLessThanOrEqual(0);
  });

  test("shows numbers only at the rows of the outermost list", async ({
    q,
  }) => {
    const expectNumber = async (
      nav: string,
      link: string,
      visible: boolean,
    ) => {
      const row = query(q.navigation(nav)).link(link);
      await test
        .expect(row.locator(".ui-toc-link-marker"))
        .toBeVisible({ visible });
    };
    await expectNumber("Right to left", "الاستخدام", true);
    await expectNumber("Right to left", "مثال بسيط", false);
    // A table of contents without markers shows none.
    await expectNumber("Five levels", "Overview", false);
    await expectNumber("Five levels", "Getting started", false);
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

  test("moves a long list with the headings, not on its own", async ({
    page,
    q,
  }) => {
    const nav = q.navigation("Sticky label");
    await page.evaluate(() => {
      document.getElementById("chapter-1")?.scrollIntoView({ block: "start" });
    });
    await test
      .expect(query(nav).link("Chapter 1"))
      .toHaveAttribute("aria-current", "location");
    const result = await followArticle(nav, "chapter-1", "chapter-8");
    test.expect(result.steps).toBeGreaterThan(10);
    test.expect(result.distance).toBeGreaterThan(0);
    test.expect(result.drifts).toEqual([]);
    test.expect(result.backs).toEqual([]);
    test.expect(result.jumps).toEqual([]);
  });

  test("follows headings side by side without jumping a row", async ({
    page,
    q,
  }) => {
    const nav = q.navigation("Scrolling cards");
    await page.evaluate(() => {
      document
        .getElementById("side-apples")
        ?.scrollIntoView({ block: "start" });
    });
    await test
      .expect(query(nav).link("Apples"))
      .toHaveAttribute("aria-current", "location");
    const result = await followArticle(nav, "side-apples", "side-grapes");
    test.expect(result.steps).toBeGreaterThan(10);
    test.expect(result.distance).toBeGreaterThan(0);
    test.expect(result.drifts).toEqual([]);
    test.expect(result.backs).toEqual([]);
    test.expect(result.jumps).toEqual([]);
  });

  test("follows a linked heading side by side without jumping a row", async ({
    q,
  }) => {
    // The linked heading is the second one of its row, which stays current
    // until the next row passes.
    const nav = query(q.navigation("Scrolling cards"));
    await nav.link("Bananas").click();
    await test
      .expect(nav.link("Bananas"))
      .toHaveAttribute("aria-current", "location");
    const result = await followArticle(
      q.navigation("Scrolling cards"),
      "side-bananas",
      "side-grapes",
    );
    test.expect(result.steps).toBeGreaterThan(10);
    test.expect(result.distance).toBeGreaterThan(0);
    test.expect(result.drifts).toEqual([]);
    test.expect(result.backs).toEqual([]);
    test.expect(result.jumps).toEqual([]);
  });

  test("follows headings with uneven scroll margins without jumping", async ({
    page,
    q,
  }) => {
    const nav = q.navigation("Uneven margins");
    await page.evaluate(() => {
      document.getElementById("margins-1")?.scrollIntoView({ block: "start" });
    });
    await test
      .expect(query(nav).link("Topic 1"))
      .toHaveAttribute("aria-current", "location");
    const result = await followArticle(nav, "margins-1", "margins-8");
    test.expect(result.steps).toBeGreaterThan(10);
    test.expect(result.distance).toBeGreaterThan(0);
    test.expect(result.drifts).toEqual([]);
    test.expect(result.backs).toEqual([]);
    test.expect(result.jumps).toEqual([]);
  });

  test("keeps a long list where it was scrolled by hand", async ({
    page,
    q,
  }) => {
    const nav = q.navigation("Sticky label");
    const getScrollTop = () => nav.evaluate((element) => element.scrollTop);
    await page.evaluate(() => {
      document.getElementById("chapter-10")?.scrollIntoView({ block: "start" });
    });
    await test
      .expect(query(nav).link("Chapter 10"))
      .toHaveAttribute("aria-current", "location");
    await test.expect.poll(getScrollTop).toBeGreaterThan(0);
    await nav.hover();
    await page.mouse.wheel(0, -(await getScrollTop()));
    await test.expect.poll(getScrollTop).toBe(0);
    // The list would move back in the update frame after its own scroll event,
    // which no state marks.
    await flushFrames(page);
    test.expect(await getScrollTop()).toBe(0);
    // Scrolling the article brings the rows on screen back. A hover over the
    // article would scroll the page first, which also moves the headings, so
    // only the article scrolls here, as a wheel over it would.
    await q.article("Article").evaluate((element) => {
      element.scrollTop += 8;
    });
    await test.expect.poll(getScrollTop).toBeGreaterThan(0);
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
    // The bar covers both headings of the row. A heading beside the first one
    // doesn't end its section. The bar glides through the rows above on its
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
      .expect(await getBarLinks(sideNav))
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
      .poll(() => getBarLinks(nav))
      .toEqual(["First step", "Second step", "Third step"]);
    // The details push the later steps out of the panel, and the panel starts
    // to scroll.
    await q.button("Show details").click();
    await test.expect.poll(() => getBarLinks(nav)).not.toContain("Third step");
    // The last step can't reach the top. At the end of the panel, the
    // activation line has slid down past it.
    await q.heading("Third step").evaluate((element) => {
      element.scrollIntoView({ block: "start" });
    });
    await test
      .expect(query(nav).link("Third step"))
      .toHaveAttribute("aria-current", "location");
    await test.expect.poll(() => getBarLinks(nav)).toContain("Third step");
  });
});
