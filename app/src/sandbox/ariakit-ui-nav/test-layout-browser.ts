import type { Locator } from "@playwright/test";
import { expect } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";
import { getBox } from "../ariakit-ui-shell/test-helpers.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  // https://github.com/ariakit/ariakit/pull/7536#discussion_r4023270769
  test("keeps a custom ordered list in one scrolling row", async ({ q }) => {
    await q.checkbox("Ordered navigation list").check();
    const nav = q.navigation("Project pages");
    await expect(nav.locator("ol")).toHaveCSS("display", "contents");
    for (const link of await query(nav).link().all()) {
      await expect(link).toHaveCSS("flex-shrink", "0");
      await expect(link).toHaveCSS("white-space", "nowrap");
    }
    await expect
      .poll(() => nav.evaluate((node) => node.scrollWidth > node.clientWidth))
      .toBe(true);
  });

  // https://github.com/ariakit/ariakit/pull/7536#discussion_r4023270759
  for (const rtl of [false, true]) {
    test(`spaces horizontal groups while their rows stay vertical${rtl ? " in RTL" : ""}`, async ({
      q,
    }) => {
      if (rtl) {
        await q.checkbox("Right to left").check();
      }
      const nav = q.navigation("Project groups");
      const groups = query(nav).group();
      for (const [option, gap] of [
        ["8", 32],
        ["4", 16],
      ] as const) {
        await q.combobox("Group spacing").selectOption(option);
        await expect
          .poll(async () => {
            const [first, second] = await Promise.all([
              getBox(groups.first()),
              getBox(groups.last()),
            ]);
            return rtl
              ? first.x - second.x - second.width
              : second.x - first.x - first.width;
          })
          .toBeCloseTo(gap, 0);
      }
      for (const names of [
        ["Project overview", "Project activity"],
        ["People", "Teams"],
      ]) {
        const [firstName, secondName] = names;
        const first = await getBox(query(nav).link(firstName));
        const second = await getBox(query(nav).link(secondName));
        expect(second.y).toBeGreaterThanOrEqual(first.y + first.height);
        expect(second.x).toBeCloseTo(first.x, 0);
      }
    });
  }

  for (const dir of ["ltr", "rtl"]) {
    test(`aligns nested disclosure rows with sibling links in ${dir}`, async ({
      q,
    }) => {
      const nav = q.navigation(`Disclosures without icons (${dir})`);
      const overview = query(nav).link("Overview");
      const components = query(nav).button("Components");
      await expect
        .poll(async () => {
          const linkEdge = await overview.evaluate(
            (node, rtl) => node.getBoundingClientRect()[rtl ? "right" : "left"],
            dir === "rtl",
          );
          const buttonEdge = await components.evaluate(
            (node, rtl) => node.getBoundingClientRect()[rtl ? "right" : "left"],
            dir === "rtl",
          );
          return buttonEdge - linkEdge;
        })
        .toBeCloseTo(0, 0);
    });
  }

  for (const dir of ["ltr", "rtl"] as const) {
    test(`keeps section rows and an end bar on the nav's end edge in ${dir}`, async ({
      page,
      q,
    }) => {
      const nav = q.navigation(`End bar across sections (${dir})`);
      const bar = nav.locator(":scope > .glider");
      const overview = query(nav).link("Overview");
      const styling = query(nav).button("Styling");
      const themes = query(nav).link("Themes");
      const tokens = query(nav).link("Tokens");
      const components = query(nav).button("Components");
      const buttonLink = query(nav).link("Button");
      const padded = query(nav).button("Padded");
      const alpha = query(nav).link("Alpha");
      // The start and end edges of a box in the nav's direction. The bar's
      // start edge is the one that faces the row it follows.
      const start = async (locator: Locator) => {
        const box = await getBox(locator);
        return dir === "rtl" ? box.x + box.width : box.x;
      };
      const end = async (locator: Locator) => {
        const box = await getBox(locator);
        return dir === "rtl" ? box.x : box.x + box.width;
      };
      await nav.scrollIntoViewIfNeeded();
      // A row in a section ends where its button and a top-level link end, with
      // a guide and without one.
      await expect
        .poll(async () => (await end(styling)) - (await end(overview)))
        .toBeCloseTo(0, 0);
      for (const row of [themes, buttonLink]) {
        await expect
          .poll(async () => (await end(row)) - (await end(overview)))
          .toBeCloseTo(0, 0);
      }
      // The bar starts on the end edge of the current row, so it keeps one line
      // as the current row moves from the top level into the sections.
      await overview.click();
      await expect
        .poll(async () => (await start(bar)) - (await end(overview)))
        .toBeCloseTo(0, 0);
      const line = await start(bar);
      for (const row of [themes, buttonLink]) {
        await row.click();
        await expect.poll(() => start(bar)).toBeCloseTo(line, 0);
      }
      // A body the caller pads insets its rows' end edge, and the bar with it,
      // by that padding: $p={3} is three spacing steps, 12px at the sandbox's
      // 16px font. The start edge keeps the label indent, so it stays where the
      // rows of the unpadded section without a guide start.
      const inset = dir === "rtl" ? -12 : 12;
      await alpha.click();
      await expect
        .poll(async () => (await end(padded)) - (await end(alpha)))
        .toBeCloseTo(inset, 0);
      await expect
        .poll(async () => line - (await start(bar)))
        .toBeCloseTo(inset, 0);
      await expect
        .poll(async () => (await start(alpha)) - (await start(buttonLink)))
        .toBeCloseTo(0, 0);
      // Rows keep their button's radius, in the padded body too.
      for (const [row, header] of [
        [themes, styling],
        [alpha, padded],
      ] as const) {
        const radius = await header.evaluate(
          (node) => getComputedStyle(node).borderRadius,
        );
        await expect(row).toHaveCSS("border-radius", radius);
      }
      // One nav gap under a button, between its rows and after its last one.
      // The padded body keeps that gap and pads its rows inside it.
      const gap = await nav.evaluate((node) =>
        Number.parseFloat(getComputedStyle(node).rowGap),
      );
      const below = async (upper: Locator, lower: Locator) => {
        const [top, bottom] = await Promise.all([getBox(upper), getBox(lower)]);
        return bottom.y - top.y - top.height;
      };
      expect(await below(styling, themes)).toBeCloseTo(gap, 0);
      expect(await below(themes, tokens)).toBeCloseTo(gap, 0);
      expect(await below(tokens, components)).toBeCloseTo(gap, 0);
      expect(await below(padded, alpha)).toBeCloseTo(gap + 12, 0);
      // The guide runs along the section's rows: it starts one nav gap under
      // the button, where the first row starts, and ends with the last row, one
      // nav gap before the next button. It is a pseudo-element of the content
      // the button controls, so its edges come from its computed insets there.
      const contentId = await styling.getAttribute("aria-controls");
      const content = nav.locator(`[id="${contentId}"]`);
      const guide = await content.evaluate((node) => {
        const style = getComputedStyle(node, "::before");
        const box = node.getBoundingClientRect();
        return {
          top: box.top + Number.parseFloat(style.top),
          bottom: box.bottom - Number.parseFloat(style.bottom),
        };
      });
      const [stylingBox, tokensBox, componentsBox] = await Promise.all([
        getBox(styling),
        getBox(tokens),
        getBox(components),
      ]);
      expect(guide.top - stylingBox.y - stylingBox.height).toBeCloseTo(gap, 0);
      expect(guide.bottom - tokensBox.y - tokensBox.height).toBeCloseTo(0, 0);
      expect(componentsBox.y - guide.bottom).toBeCloseTo(gap, 0);
      // A section row ends on the edge where its content clips, so it draws its
      // keyboard focus ring inside its box, where the clip cannot cut it. A
      // top-level link keeps the ring outside its box.
      await components.focus();
      await page.keyboard.press("Tab");
      await expect(buttonLink).toBeFocused();
      await expect(buttonLink).toHaveCSS("outline-width", "2px");
      await expect(buttonLink).toHaveCSS("outline-offset", "-2px");
      await expect(overview).toHaveCSS("outline-offset", "1px");
      // A padded body still leaves its rows on the content's start edge, so its
      // rows keep the inset too.
      await expect(alpha).toHaveCSS("outline-offset", "-2px");
    });
  }

  test("preserves default link corners in plain and nested navigation", async ({
    q,
  }) => {
    for (const name of ["Rows", "Disclosures without icons (ltr)"]) {
      const link = query(q.navigation(name)).link("Overview");
      for (const corner of [
        "top-left",
        "top-right",
        "bottom-left",
        "bottom-right",
      ]) {
        await expect(link).toHaveCSS(`border-${corner}-radius`, "6px");
      }
    }
  });

  test("places a nonanimated bar at the frame edge or an explicit distance", async ({
    q,
  }) => {
    const nav = q.navigation("Project pages");
    const link = query(nav).link("Overview");
    const bar = nav.locator(":scope > .glider");
    await nav.scrollIntoViewIfNeeded();
    await expect(bar).toBeVisible();
    const radius = await link.evaluate(
      (node) => getComputedStyle(node).borderRadius,
    );
    await expect
      .poll(async () => {
        const [box, bounds] = await Promise.all([getBox(bar), getBox(nav)]);
        return box.y + box.height - bounds.y - bounds.height;
      })
      .toBeCloseTo(0, 0);
    await expect(bar).toHaveCSS("transition-duration", "0s");
    await q.combobox("Bar distance").selectOption("6px");
    await expect
      .poll(
        async () =>
          (await getBox(bar)).y -
          ((await getBox(link)).y + (await getBox(link)).height),
      )
      .toBeCloseTo(6, 0);
    await q.combobox("Bar side").selectOption("start");
    await expect
      .poll(async () => {
        const box = await getBox(bar);
        return (await getBox(link)).y - box.y - box.height;
      })
      .toBeCloseTo(6, 0);
    await q.combobox("Bar distance").selectOption("frame");
    await expect
      .poll(async () => (await getBox(bar)).y - (await getBox(nav)).y)
      .toBeCloseTo(0, 0);
    await expect(link).toHaveCSS("border-radius", radius);
    await q.checkbox("Add frame padding").uncheck();
    await q.combobox("Bar side").selectOption("end");
    await q.combobox("Bar distance").selectOption("auto");
    await expect(nav).toHaveCSS("padding", "0px");
    await expect
      .poll(async () => {
        const [box, item] = await Promise.all([getBox(bar), getBox(link)]);
        return box.y - item.y - item.height;
      })
      .toBeCloseTo(0, 0);
    await expect(bar).toBeInViewport({ ratio: 1 });
    await q.combobox("Bar distance").selectOption("6px");
    for (const side of ["start", "end"]) {
      await q.combobox("Bar side").selectOption(side);
      await expect
        .poll(async () => {
          const [box, item] = await Promise.all([getBox(bar), getBox(link)]);
          return side === "start"
            ? item.y - box.y - box.height
            : box.y - item.y - item.height;
        })
        .toBeCloseTo(6, 0);
      await expect(bar).toBeInViewport({ ratio: 1 });
    }
    const standalone = q.navigation("Single link");
    await expect(standalone.locator(":scope > .glider")).toBeVisible();
    await expect(query(standalone).link("Home")).toHaveAttribute(
      "aria-current",
      "location",
    );
  });

  for (const rtl of [false, true]) {
    test(`keeps links and the bar in one scrolling row${rtl ? " in RTL" : ""}`, async ({
      q,
      page,
    }) => {
      if (rtl) await q.checkbox("Right to left").check();
      const nav = q.navigation("Project pages");
      const links = query(nav).link();
      expect(
        await nav.evaluate((node) => node.scrollWidth > node.clientWidth),
      ).toBe(true);
      await expect(nav.locator("ul")).toHaveCSS("display", "contents");
      for (const item of await nav.locator("li").all()) {
        await expect(item).toHaveCSS("display", "contents");
      }
      await links.first().focus();
      for (const link of (await links.all()).slice(1)) {
        await page.keyboard.press("Tab");
        await expect(link).toBeFocused();
        const box = await getBox(link);
        const bounds = await getBox(nav);
        expect(box.x).toBeGreaterThanOrEqual(bounds.x - 1);
        expect(box.x + box.width).toBeLessThanOrEqual(
          bounds.x + bounds.width + 1,
        );
      }
      await page.keyboard.press("Enter");
      await expect(links.last()).toHaveAttribute("aria-current", "step");
      const bar = nav.locator(":scope > .glider");
      await expect
        .poll(async () => {
          const [marker, item] = await Promise.all([
            getBox(bar),
            getBox(links.last()),
          ]);
          return marker.x - item.x;
        })
        .toBeCloseTo(0, 0);
      await q.combobox("Bar distance").selectOption("frame");
      await expect
        .poll(async () => {
          const [marker, frame] = await Promise.all([getBox(bar), getBox(nav)]);
          return marker.y + marker.height - frame.y - frame.height;
        })
        .toBeCloseTo(0, 0);
      await nav.evaluate((node, rtl) => {
        node.scrollLeft += rtl ? 36 : -36;
      }, rtl);
      await page.evaluate(() => window.scrollBy(0, 20));
      await expect
        .poll(async () => {
          const [marker, item] = await Promise.all([
            getBox(bar),
            getBox(links.last()),
          ]);
          return marker.x - item.x;
        })
        .toBeCloseTo(0, 0);
      await expect
        .poll(async () => {
          const [box, bounds] = await Promise.all([getBox(bar), getBox(nav)]);
          return box.y + box.height - bounds.y - bounds.height;
        })
        .toBeCloseTo(0, 0);
      const top = (await getBox(links.first())).y;
      for (const link of await links.all()) {
        expect((await getBox(link)).y).toBeCloseTo(top, 0);
      }
    });
  }
});
