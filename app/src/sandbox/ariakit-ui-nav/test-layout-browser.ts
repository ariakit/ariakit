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

  // https://github.com/ariakit/ariakit/issues/7574
  test("keeps badges and avatars on the line box on every nav row", async ({
    q,
  }) => {
    const navigation = q.navigation("Badges and avatars");
    const nav = query(navigation);
    const inbox = nav.button(/^Inbox/);
    const drafts = nav.link(/^Drafts/);
    const height = async (locator: Locator) => (await getBox(locator)).height;
    await navigation.scrollIntoViewIfNeeded();
    // $iconSize={5} is five spacing steps, 20px at the sandbox's 16px font,
    // which is smaller than the row's line box. A section row's icon and a
    // NavIcon read it through different properties, so both are measured.
    const lineHeight = await inbox.evaluate((node) =>
      Number.parseFloat(getComputedStyle(node).lineHeight),
    );
    expect(lineHeight).toBeGreaterThan(20);
    const sectionIcon = inbox
      .locator(":scope > .disclosure-button-slot")
      .first();
    const linkIcon = drafts.locator(".control-slot").first();
    await expect.poll(() => height(sectionIcon)).toBeCloseTo(20, 0);
    await expect.poll(() => height(linkIcon)).toBeCloseTo(20, 0);
    // A badge and an avatar keep the line box every control slot gives them,
    // after the label of a section row or a link row and in the icon column:
    // the icon size sizes only the icons.
    const slots = [
      ["link badge", drafts, "3"],
      ["link avatar", nav.link(/^Profile/), "JD"],
      ["section badge", inbox, "12"],
      ["section avatar", nav.button(/^Design/), "MK"],
      ["icon column badge", nav.link(/Notifications/), "9"],
      ["icon column avatar", nav.link(/Ana Lima/), "AL"],
    ] as const;
    const heights = () =>
      Promise.all(
        slots.map(async ([name, row, text]) => {
          const slot = row.locator(".control-slot").filter({ hasText: text });
          return [name, await height(slot)];
        }),
      );
    await expect
      .poll(heights)
      .toEqual(slots.map(([name]) => [name, expect.closeTo(lineHeight, 0)]));
  });

  // https://github.com/ariakit/ariakit/issues/7589
  test("keeps a pushed shortcut at the row end with its keys in order in RTL", async ({
    q,
  }) => {
    // How far the ⌘K shortcut, which an auto start margin pushes along its row,
    // ends from the end edge of that row in the row's direction.
    const getShortcutEnd = async (
      name: string,
      label: RegExp,
      rtl: boolean,
    ) => {
      const nav = q.navigation(name);
      const row = query(nav).button(label);
      const shortcut = row.locator(".control-slot").filter({ hasText: "⌘K" });
      await nav.scrollIntoViewIfNeeded();
      const [rowBox, shortcutBox] = await Promise.all([
        getBox(row),
        getBox(shortcut),
      ]);
      return rtl
        ? shortcutBox.x - rowBox.x
        : rowBox.x + rowBox.width - shortcutBox.x - shortcutBox.width;
    };
    const ltrEnd = await getShortcutEnd("Command row", /^Search/, false);
    await expect
      .poll(() => getShortcutEnd("التنقل", /^بحث/, true))
      .toBeCloseTo(ltrEnd, 0);
    // The keys are one text node, so a range measures each key on its own.
    const shortcut = query(q.navigation("التنقل")).text("⌘K");
    const keys = await shortcut.evaluate((node) => {
      const text = node.firstChild;
      if (!text) {
        throw new Error("The shortcut has no text");
      }
      const range = node.ownerDocument.createRange();
      const getX = (index: number) => {
        range.setStart(text, index);
        range.setEnd(text, index + 1);
        return range.getBoundingClientRect().x;
      };
      return { command: getX(0), key: getX(1) };
    });
    expect(keys.command).toBeLessThan(keys.key);
  });

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

  // Measures a row's leading icon slot and its label from the row's start edge.
  // The icon leads every measured row. A disclosure's indicator is a slot too,
  // and it sits at the end of its row.
  const measureRow = async (row: Locator, label: string) => {
    const [rowBox, iconBox, labelBox] = await Promise.all([
      getBox(row),
      getBox(row.locator(".control-slot").first()),
      getBox(query(row).text(label)),
    ]);
    return {
      iconStart: iconBox.x - rowBox.x,
      iconWidth: iconBox.width,
      iconHeight: iconBox.height,
      iconGap: labelBox.x - iconBox.x - iconBox.width,
      labelStart: labelBox.x - rowBox.x,
      labelBottom: labelBox.y + labelBox.height,
    };
  };

  test("aligns a link's slot, label, and description with a disclosure row", async ({
    q,
  }) => {
    const nav = query(q.navigation("Link descriptions"));
    const measure = async (
      row: Locator,
      label: string,
      description: RegExp,
    ) => {
      const [metrics, descriptionBox] = await Promise.all([
        measureRow(row, label),
        getBox(query(row).text(description)),
      ]);
      const descriptionGap = descriptionBox.y - metrics.labelBottom;
      return { ...metrics, descriptionGap };
    };
    const link = () => measure(nav.link(/^Inbox/), "Inbox", /^Messages/);
    const button = () => measure(nav.button("Projects"), "Projects", /^Pages/);
    await q.navigation("Link descriptions").scrollIntoViewIfNeeded();
    // $iconSize={5} is five spacing steps, 20px at the sandbox's 16px font.
    await expect.poll(async () => (await link()).iconWidth).toBeCloseTo(20, 0);
    const [linkRow, buttonRow] = await Promise.all([link(), button()]);
    expect(linkRow.iconHeight).toBeCloseTo(20, 0);
    expect(linkRow.iconWidth).toBeCloseTo(buttonRow.iconWidth, 0);
    expect(linkRow.iconStart).toBeCloseTo(buttonRow.iconStart, 0);
    expect(linkRow.labelStart).toBeCloseTo(buttonRow.labelStart, 0);
    expect(buttonRow.descriptionGap).toBeGreaterThan(0);
    expect(linkRow.descriptionGap).toBeCloseTo(buttonRow.descriptionGap, 0);
  });

  test("keeps a link's badge on the line box and wraps its label and description", async ({
    q,
  }) => {
    const nav = query(q.navigation("Link descriptions"));
    const inbox = nav.link(/^Inbox/);
    const getLineHeight = (locator: Locator) =>
      locator.evaluate((node) =>
        Number.parseFloat(getComputedStyle(node).lineHeight),
      );
    await inbox.scrollIntoViewIfNeeded();
    // A badge keeps the line box every control slot gives it: the nav's icon
    // size, 20px here, sizes only the icon.
    const badge = inbox.locator(".control-slot").last();
    await expect(badge).toHaveText("4");
    const lineHeight = await getLineHeight(inbox);
    expect(lineHeight).toBeGreaterThan(20);
    await expect
      .poll(async () => (await getBox(badge)).height)
      .toBeCloseTo(lineHeight, 0);
    // The content fills the row, so the badge ends up at the row's end, closer
    // to it than its own width.
    const [rowBox, badgeBox] = await Promise.all([
      getBox(inbox),
      getBox(badge),
    ]);
    const endSpace = rowBox.x + rowBox.width - badgeBox.x - badgeBox.width;
    expect(endSpace).toBeGreaterThanOrEqual(0);
    expect(endSpace).toBeLessThan(badgeBox.width);
    // The label and the description wrap where a button's own would truncate,
    // and each stays inside its own row.
    const settings = nav.link("Workspace settings and preferences");
    const wrappingTexts = [
      [settings, query(settings).text("Workspace settings and preferences")],
      [inbox, query(inbox).text(/^Messages/)],
    ] as const;
    for (const [row, text] of wrappingTexts) {
      const [ownRowBox, box, textLineHeight] = await Promise.all([
        getBox(row),
        getBox(text),
        getLineHeight(text),
      ]);
      expect(box.height).toBeGreaterThanOrEqual(textLineHeight * 2);
      expect(box.x + box.width).toBeLessThanOrEqual(
        ownRowBox.x + ownRowBox.width,
      );
    }
  });

  test("spaces a link's description from the label it shares a line with", async ({
    q,
  }) => {
    const releases = query(q.navigation("Link descriptions")).link(/^Releases/);
    const label = query(releases).text("Releases");
    const description = query(releases).text("2 drafts");
    await releases.scrollIntoViewIfNeeded();
    // A link turns the control's own gap off, so the content has to bring one.
    const columnGap = await releases
      .locator(".control-content")
      .evaluate((node) => Number.parseFloat(getComputedStyle(node).columnGap));
    expect(columnGap).toBeGreaterThan(0);
    await expect
      .poll(async () => {
        const [labelBox, descriptionBox] = await Promise.all([
          getBox(label),
          getBox(description),
        ]);
        return descriptionBox.x - labelBox.x - labelBox.width;
      })
      .toBeCloseTo(columnGap, 0);
    // The description stays on the label's line instead of under it.
    const [labelBox, descriptionBox] = await Promise.all([
      getBox(label),
      getBox(description),
    ]);
    expect(descriptionBox.y).toBeLessThan(labelBox.y + labelBox.height);
  });

  test("keeps a link's label on a disclosure row's label column behind an icon wider than the line", async ({
    q,
  }) => {
    const nav = query(q.navigation("Wide icons"));
    const button = () => measureRow(nav.button("Projects"), "Projects");
    await q.navigation("Wide icons").scrollIntoViewIfNeeded();
    // $iconSize={8} is eight spacing steps, 32px at the sandbox's 16px font,
    // which is wider than the row's line box.
    const lineHeight = await nav
      .button("Projects")
      .evaluate((node) => Number.parseFloat(getComputedStyle(node).lineHeight));
    expect(lineHeight).toBeLessThan(32);
    await expect
      .poll(async () => (await button()).iconWidth)
      .toBeCloseTo(32, 0);
    const buttonRow = await button();
    // The end margin takes the icon's overflow off, so the gap left between a
    // wide icon and its label is the nav's row gap: three spacing steps, 12px.
    // The margin wins over the slot's own by stylesheet order, in the
    // disclosure row too, so the rows are not only compared to each other.
    expect(buttonRow.iconGap).toBeCloseTo(12, 0);
    // One row has its icon in a NavLinkSlot, the other in a NavIcon.
    for (const name of ["Inbox", "Settings"]) {
      const linkRow = await measureRow(nav.link(name), name);
      expect(linkRow.iconWidth).toBeCloseTo(32, 0);
      expect(linkRow.labelStart).toBeCloseTo(buttonRow.labelStart, 0);
      expect(linkRow.iconGap).toBeCloseTo(buttonRow.iconGap, 0);
    }
  });

  // https://github.com/ariakit/ariakit/issues/7553
  test("lets a row override its corners and the offset of its body", async ({
    q,
  }) => {
    const nav = q.navigation("Row overrides");
    const account = query(nav).button("Account");
    const members = query(nav).link("Members");
    const settings = query(nav).button("Settings");
    const profile = query(nav).link("Profile");
    await nav.scrollIntoViewIfNeeded();
    const gap = await nav.evaluate((node) =>
      Number.parseFloat(getComputedStyle(node).rowGap),
    );
    const below = async (upper: Locator, lower: Locator) => {
      const [top, bottom] = await Promise.all([getBox(upper), getBox(lower)]);
      return bottom.y - top.y - top.height;
    };
    // Account keeps the nav gap under its button. Settings sets $bodyOffset={3}
    // instead: three spacing steps, 12px at the sandbox's 16px font.
    await expect.poll(() => below(account, members)).toBeCloseTo(gap, 0);
    await expect.poll(() => below(settings, profile)).toBeCloseTo(12, 0);
    // The guide starts at the body offset too. It is a pseudo-element of the
    // content the button controls.
    const contentId = await settings.getAttribute("aria-controls");
    const guideTop = await nav
      .locator(`[id="${contentId}"]`)
      .evaluate((node) => {
        const style = getComputedStyle(node, "::before");
        return node.getBoundingClientRect().top + Number.parseFloat(style.top);
      });
    const settingsBox = await getBox(settings);
    expect(guideTop - settingsBox.y - settingsBox.height).toBeCloseTo(12, 0);
    // A row nested in the nav frame is concentric with it, so its own radius
    // shows only when forced. $rounded="none" then replaces the nav row's
    // radius, and the button stays concentric with it.
    await expect(account).not.toHaveCSS("border-top-left-radius", "0px");
    await expect(settings).toHaveCSS("border-top-left-radius", "0px");
  });

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
