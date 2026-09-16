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
