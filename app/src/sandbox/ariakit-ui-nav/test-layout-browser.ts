import { expect } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";
import { getBox } from "../ariakit-ui-shell/test-helpers.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
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
    const navBox = await getBox(nav);
    await expect
      .poll(async () => {
        const box = await getBox(bar);
        return box.y + box.height;
      })
      .toBeCloseTo(navBox.y + navBox.height, 0);
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
      .poll(async () => (await getBox(bar)).y)
      .toBeCloseTo(navBox.y, 0);
    await expect(link).toHaveCSS("border-radius", radius);
    await q.checkbox("Add frame padding").uncheck();
    await q.combobox("Bar side").selectOption("end");
    await q.combobox("Bar distance").selectOption("auto");
    await expect(nav).toHaveCSS("padding", "0px");
    await expect
      .poll(async () => (await getBox(bar)).y)
      .toBeCloseTo((await getBox(link)).y + (await getBox(link)).height, 0);
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
        .poll(async () => (await getBox(bar)).x)
        .toBeCloseTo((await getBox(links.last())).x, 0);
      await q.combobox("Bar distance").selectOption("frame");
      await nav.evaluate((node, rtl) => {
        node.scrollLeft += rtl ? 36 : -36;
      }, rtl);
      await page.evaluate(() => window.scrollBy(0, 20));
      await expect
        .poll(async () => (await getBox(bar)).x)
        .toBeCloseTo((await getBox(links.last())).x, 0);
      await expect
        .poll(async () => {
          const box = await getBox(bar);
          return box.y + box.height;
        })
        .toBeCloseTo((await getBox(nav)).y + (await getBox(nav)).height, 0);
      const top = (await getBox(links.first())).y;
      for (const link of await links.all()) {
        expect((await getBox(link)).y).toBeCloseTo(top, 0);
      }
    });
  }
});
