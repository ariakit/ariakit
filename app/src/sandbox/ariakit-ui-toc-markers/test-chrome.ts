import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  test("ends the bends on the edges of the lines they join", async ({ q }) => {
    const nav = q.navigation("Dot steps");
    const edges = await nav.evaluate((element) => {
      const getEnd = (name: string, pseudo: string) => {
        const links = [...element.querySelectorAll("a")];
        const link = links.find((item) => item.textContent === name);
        const guide = link?.querySelector(".toc-link-guide");
        if (!guide) return Number.NaN;
        const inset = getComputedStyle(guide, pseudo).insetInlineEnd;
        return guide.getBoundingClientRect().right - Number.parseFloat(inset);
      };
      return {
        bendIn: getEnd("Install", "::after"),
        lineAfterBendIn: getEnd("Configure", "::after"),
        bendOut: getEnd("Deploy", "::before"),
        lineBeforeBendOut: getEnd("Theme", "::after"),
      };
    });
    // A display rounds each edge to a device pixel, so edges that differ by a
    // fraction can land on different pixels. The rows have half pixels at this
    // scale, where a difference shows. Fractional scales also snap the borders,
    // which this geometry can't show.
    test.expect(edges.bendIn).toBeGreaterThan(0);
    test.expect(edges.bendOut).toBeGreaterThan(0);
    test.expect(edges.bendIn).toBe(edges.lineAfterBendIn);
    test.expect(edges.bendOut).toBe(edges.lineBeforeBendOut);
  });

  test("changes the colors of the markers at once with the theme", async ({
    page,
    q,
  }) => {
    const navs = [q.navigation("Numbered steps"), q.navigation("Dot steps")];
    await page.emulateMedia({ colorScheme: "dark" });
    for (const nav of navs) {
      const properties = await nav.evaluate((element) => {
        const animations = element.getAnimations({ subtree: true });
        return animations.flatMap((animation) => {
          const { effect } = animation;
          if (!(effect instanceof KeyframeEffect)) return [];
          if (!effect.target?.matches(".toc-link-marker, .toc-link-dot")) {
            return [];
          }
          return animation instanceof CSSTransition
            ? [animation.transitionProperty]
            : [];
        });
      });
      test.expect(properties).toEqual([]);
    }
  });

  test("shows the first range without filling the markers", async ({
    page,
    q,
  }) => {
    // The transition can end before any later read, so a listener from the
    // start of the page counts it. No user-facing state tracks the transitions.
    await page.addInitScript(() => {
      const runs: string[] = [];
      Object.assign(window, { fillRuns: runs });
      document.addEventListener(
        "transitionrun",
        (event) => {
          if (event.pseudoElement !== "::after") return;
          if (!(event.target instanceof HTMLElement)) return;
          runs.push(event.target.className);
        },
        true,
      );
    });
    await page.reload();
    const dot = query(q.navigation("Dot steps"))
      .link("Install")
      .locator(".toc-link-dot");
    await test.expect(dot).toHaveAttribute("style", /--toc-piece-top/);
    // The range is in place above, and transitionrun fires on a later frame.
    await flushFrames(page);
    const runs = await page.evaluate(() => {
      return "fillRuns" in window ? window.fillRuns : null;
    });
    test.expect(runs).toEqual([]);
  });

  test("shows each marker only at the rows of its own list", async ({ q }) => {
    const expectMarker = async (
      nav: string,
      link: string,
      marker: "number" | "dot" | null,
    ) => {
      const row = query(q.navigation(nav)).link(link);
      await test
        .expect(row.locator(".toc-link-marker"))
        .toBeVisible({ visible: marker === "number" });
      await test
        .expect(row.locator(".toc-link-dot"))
        .toBeVisible({ visible: marker === "dot" });
    };
    // A nested list has its own marker, which neither the rows around it nor a
    // list inside it take.
    await expectMarker("Numbered steps", "Overview", null);
    await expectMarker("Numbered steps", "Install", "number");
    await expectMarker("Numbered steps", "Theme", null);
    await expectMarker("Dot steps", "Overview", null);
    await expectMarker("Dot steps", "Install", "dot");
    await expectMarker("Dot steps", "Theme", null);
  });

  test("measures dots that show after the first render", async ({ q }) => {
    const nav = q.navigation("Dots shown later");
    const dot = query(nav).link("Install").locator(".toc-link-dot");
    await test.expect(dot).toBeHidden();
    await q.button("Show dots").click();
    await test.expect(dot).toBeVisible();
    // The fill reads the position of the dot, which only a visible dot has.
    await test.expect(dot).toHaveAttribute("style", /--toc-piece-top:\s*[1-9]/);
  });
});
