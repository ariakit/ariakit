import { expect } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";
import { getSidebar, selectScenario } from "./test-helpers.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  test("keeps a footer navigation bar on the navigation edge above a bottom safe area", async ({
    page,
    q,
  }) => {
    await selectScenario(q, "bar");
    const nav = q.navigation("Footer pages");
    const bar = query(nav).link("Home").locator(".control-bar");
    const session = await page.context().newCDPSession(page);
    // A larger safe area lets the row outgrow the footer's content box.
    for (const inset of [34, 10, 0]) {
      await session.send("Emulation.setSafeAreaInsetsOverride", {
        insets: { bottom: inset, bottomMax: inset },
      });
      await expect(page.locator(".shell-footer")).toHaveCSS(
        "padding-bottom",
        `${inset}px`,
      );
      await expect
        .poll(async () => {
          const [box, bounds] = await Promise.all([
            bar.boundingBox(),
            nav.boundingBox(),
          ]);
          if (!box || !bounds) return null;
          return box.y + box.height - bounds.y - bounds.height;
        })
        .toBeCloseTo(0, 0);
    }
  });

  // https://github.com/ariakit/ariakit/pull/7533#discussion_r4019535774
  test("accepts data-open directly on the sidebar body", async ({ q }) => {
    await selectScenario(q, "geometry");
    const body = q.navigation("Layout contents", { includeHidden: true });
    const toggle = q.button("Toggle layout contents");
    await expect(body).not.toHaveAttribute("data-open");
    await expect(body).toBeHidden();
    await toggle.click();
    await expect(body).toHaveAttribute("data-open", "");
    await expect(body).toBeVisible();
    await toggle.click();
    await expect(body).not.toHaveAttribute("data-open");
    await expect(body).toBeHidden();
  });

  // https://github.com/ariakit/ariakit/issues/7532
  test("forwards sidebar props, padding and events to the landmark body", async ({
    q,
  }) => {
    await selectScenario(q, "geometry");
    const toggle = q.button("Toggle layout navigation");
    await toggle.click();
    const body = q.navigation("Layout navigation");
    const column = getSidebar(q, "Layout navigation");
    await expect(toggle).toHaveAttribute(
      "aria-controls",
      (await body.getAttribute("id")) ?? "",
    );
    await expect(body).toHaveClass(/layout-navigation/);
    await expect(body).toHaveAttribute("title", "Navigation body");
    await expect(body).toHaveAttribute(
      "aria-describedby",
      "navigation-description",
    );
    await expect(body).toHaveCSS("padding-left", "12px");
    await expect(column).not.toHaveAttribute("id");
    await expect(column).not.toHaveAttribute("aria-label");
    await expect(column).not.toHaveClass(/layout-navigation/);
    await query(body).link("Layout section").click();
    await expect(q.text("Navigation selected")).toBeVisible();
  });

  test.describe("wide", () => {
    test.use({ viewport: { width: 1280, height: 800 } });

    // https://github.com/ariakit/ariakit/issues/7532
    test("links a consumer toggle to the sidebar body without making it modal", async ({
      q,
    }) => {
      const toggle = q.button("Toggle sidebar");
      const sidebar = getSidebar(q, "Documentation");
      await expect(toggle).toHaveAttribute("aria-expanded", "true");
      await expect(toggle).toHaveAttribute(
        "aria-controls",
        (await q.navigation("Documentation").getAttribute("id")) ?? "",
      );
      // Nothing outside is inert, and Escape does nothing.
      await expect(q.main()).not.toHaveAttribute("inert");
      await query(sidebar).link("Installation").focus();
      await toggle.press("Escape");
      await expect(toggle).toHaveAttribute("aria-expanded", "true");
    });

    test("switches the fold and the compensation off together under reduced motion, whatever the inline duration", async ({
      page,
      q,
    }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await selectScenario(q, "settings");
      const sidebar = getSidebar(q, "Settings sections");
      const main = q.main();
      await expect(sidebar).toHaveCSS("width", "192px");
      await q.button("Toggle sidebar").click();
      // The shell asks for 600ms; the multiplier zeroes it.
      expect(
        await sidebar.evaluate((node) => node.getAnimations().length),
      ).toBe(0);
      // The content grids animate the compensation.
      const body = main.locator(":scope > .shell-main-body");
      expect(await body.evaluate((node) => node.getAnimations().length)).toBe(
        0,
      );
      await expect(sidebar).toHaveCSS("width", "0px");
      await expect(
        q.navigation("Settings sections", { includeHidden: true }),
      ).toHaveCSS("display", "none");
    });

    test("runs the fold on the inline duration otherwise", async ({
      page,
      q,
    }) => {
      await selectScenario(q, "settings");
      const sidebar = getSidebar(q, "Settings sections");
      await q.button("Toggle sidebar").click();
      const durations = await sidebar.evaluate((node) =>
        node.getAnimations().map((animation) => {
          const timing = animation.effect?.getComputedTiming();
          return timing?.duration;
        }),
      );
      expect(durations).toContain(600);
      // The width must remain positive through the first 100ms of the 600ms
      // fold; an eventual state assertion cannot prove that interval.
      await page.waitForTimeout(100);
      const width = await sidebar.evaluate(
        (node) => node.getBoundingClientRect().width,
      );
      expect(width).toBeGreaterThan(0);
      await expect(sidebar).toHaveCSS("width", "0px");
    });

    test("keeps the icon and the default name on a toggle whose children are false", async ({
      q,
    }) => {
      await selectScenario(q, "settings");
      // Open by default: the conditional label is false.
      const toggle = q.button("Toggle sidebar");
      await expect(toggle).toHaveAttribute("aria-expanded", "true");
      await expect(toggle.locator("svg")).toHaveCount(1);
      await toggle.click();
      // Closed: the label is the content and the name.
      await expect(q.button("Sections")).toHaveAttribute(
        "aria-expanded",
        "false",
      );
      await expect(q.button("Toggle sidebar")).toHaveCount(0);
    });
  });

  for (const [width, scenario, name, sidebarWidth] of [
    [1600, "docs", "Documentation", "256px"],
    [1600, "docs", "On this page", "0px"],
    [700, "docs", "Documentation", "0px"],
    // A second column on the same side.
    [1600, "chat", "Channels", "256px"],
    // A data-open prop instead of open.
    [1600, "geometry", "Layout contents", "0px"],
  ] as const) {
    test.describe(`at ${width}px`, () => {
      test.use({ viewport: { width, height: 900 } });

      // https://github.com/ariakit/ariakit/issues/8147
      test(`keeps the ${name} sidebar in place when its panel arrives after the column`, async ({
        q,
      }) => {
        await selectScenario(q, scenario);
        const sidebar = getSidebar(q, name);
        await expect(sidebar).toHaveCSS("width", sidebarWidth);
        // Firefox transitions the main body's slot space when the scenario
        // select remounts the shell. Let it settle so the probe below only sees
        // the transitions that it starts.
        await expect
          .poll(() =>
            sidebar.evaluate((column) => {
              const body = document.querySelector("main > .shell-main-body");
              return [column, body].flatMap(
                (element) => element?.getAnimations() ?? [],
              ).length;
            }),
          )
          .toBe(0);
        const transitions = await sidebar.evaluate((column) => {
          const shell = column.parentElement;
          const panel = column.firstElementChild;
          const body = document.querySelector("main > .shell-main-body");
          if (!shell || !panel || !body) {
            throw new Error("Missing shell, sidebar panel, or main body");
          }
          // Resolving styles starts any transition that the change caused.
          const getTransitions = () =>
            [...column.getAnimations(), ...body.getAnimations()].map(
              (animation) =>
                animation instanceof CSSTransition
                  ? animation.transitionProperty
                  : animation.id,
            );
          // While HTML streams in, the parser can insert the column, pause
          // before its panel, and let the browser resolve styles in that gap. A
          // reinserted column has no earlier style to transition from.
          const next = column.nextSibling;
          column.remove();
          panel.remove();
          shell.insertBefore(column, next);
          const gap = getTransitions();
          column.append(panel);
          return { gap, arrival: getTransitions() };
        });
        expect(transitions).toEqual({ gap: [], arrival: [] });
        await expect(sidebar).toHaveCSS("width", sidebarWidth);
      });
    });
  }
});
