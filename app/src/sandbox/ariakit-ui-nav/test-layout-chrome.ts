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

  // https://github.com/ariakit/ariakit/issues/7574
  // https://github.com/ariakit/ariakit/issues/7579
  // The default slot size 5 is in the "page @visual" capture of every engine.
  for (const [slotSize, size] of [
    ["text", 16],
    ["8", 32],
  ] as const) {
    test(`sizes badges and avatars like the icons and lines up their labels at slot size ${slotSize}`, async ({
      q,
    }) => {
      const navigation = q.navigation("Badges and avatars");
      const nav = query(navigation);
      const inbox = nav.button(/^Inbox/);
      const design = nav.button(/^Design/);
      const drafts = nav.link(/^Drafts/);
      const profile = nav.link(/^Profile/);
      const notifications = nav.link(/Notifications/);
      const anaLima = nav.link(/Ana Lima/);
      const slot = (row: Locator, text: string) =>
        row.locator(".control-slot").filter({ hasText: text });
      await q.combobox("Slot size").selectOption(slotSize);
      await navigation.scrollIntoViewIfNeeded();
      // The text size is 16px at the sandbox's font, and $slotSize={5} and
      // $slotSize={8} are five and eight spacing steps, 20px and 32px. A badge
      // or an avatar takes that size like an icon, before or after the label,
      // in a section row and a link row alike. Without $slotSize, a badge after
      // the label takes the line height instead, like a button badge.
      const lineHeight = await drafts.evaluate((node) =>
        Number.parseFloat(getComputedStyle(node).lineHeight),
      );
      const trailingSize = slotSize === "text" ? lineHeight : size;
      const squares = [
        [inbox.locator(":scope > .disclosure-button-slot").first(), size],
        [drafts.locator(".control-slot").first(), size],
        [slot(notifications, "9"), size],
        [slot(anaLima, "AL"), size],
        [slot(drafts, "3"), trailingSize],
        [slot(profile, "JD"), size],
        [slot(design, "MK"), size],
      ] as const;
      for (const [square, squareSize] of squares) {
        await expect
          .poll(async () => {
            const box = await getBox(square);
            return [box.width, box.height];
          })
          .toEqual([
            expect.closeTo(squareSize, 0),
            expect.closeTo(squareSize, 0),
          ]);
      }
      // Two digits can be wider than the slot, so that badge keeps only the
      // slot's height.
      const twoDigits = await getBox(slot(inbox, "12"));
      expect(twoDigits.height).toBeCloseTo(trailingSize, 0);
      // Every label starts on the column of an icon row's label, whether an
      // icon, a one-digit badge or an avatar leads it.
      const column = (await getBox(query(drafts).text("Drafts"))).x;
      const labels = [
        query(inbox).text("Inbox"),
        query(design).text("Design"),
        query(profile).text("Profile"),
        query(notifications).text("Notifications"),
        query(anaLima).text("Ana Lima"),
      ];
      for (const label of labels) {
        expect((await getBox(label)).x).toBeCloseTo(column, 0);
      }
      // The label fills the row, so a trailing badge or avatar sits at the row
      // end, inset like a leading slot of its size: the block padding plus half
      // the line height the slot leaves. A slot taller than the line reaches
      // into the start padding, while a trailing slot keeps the block padding
      // as its end inset.
      const [row, rowIcon, rowPadding] = await Promise.all([
        getBox(drafts),
        getBox(drafts.locator(".control-slot").first()),
        drafts.evaluate((node) =>
          parseFloat(getComputedStyle(node).paddingTop),
        ),
      ]);
      expect(rowIcon.x - row.x).toBeCloseTo(
        rowPadding + (lineHeight - size) / 2,
        0,
      );
      for (const [link, text, trailingSlotSize] of [
        [drafts, "3", trailingSize],
        [profile, "JD", size],
      ] as const) {
        const [linkBox, trailing] = await Promise.all([
          getBox(link),
          getBox(slot(link, text)),
        ]);
        const expectedInset =
          rowPadding + Math.max(0, (lineHeight - trailingSlotSize) / 2);
        expect(
          linkBox.x + linkBox.width - trailing.x - trailing.width,
        ).toBeCloseTo(expectedInset, 0);
      }
      // A section badge joins the chevron at the row end instead of following
      // the label.
      const [inboxIcon, inboxLabel, inboxBadge, chevron] = await Promise.all([
        getBox(inbox.locator(".control-slot").first()),
        getBox(query(inbox).text("Inbox")),
        getBox(slot(inbox, "12")),
        getBox(inbox.locator(".control-slot").last()),
      ]);
      const rowGap = inboxLabel.x - inboxIcon.x - inboxIcon.width;
      const badgeToChevron = chevron.x - inboxBadge.x - inboxBadge.width;
      expect(badgeToChevron).toBeGreaterThanOrEqual(0);
      expect(badgeToChevron).toBeLessThanOrEqual(rowGap + 1);
    });
  }

  for (const dir of ["ltr", "rtl"] as const) {
    test(`keeps section rows and an end bar on the nav's end edge in ${dir}`, async ({
      page,
      q,
    }) => {
      const nav = q.navigation(`End bar across sections (${dir})`);
      const bar = nav.locator(".control-bar:visible");
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
        // Boxes ignore clipping, so check that the section doesn't hide the bar
        // outside its rows.
        await expect(bar).toBeInViewport({ ratio: 1 });
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

  for (const dir of ["ltr", "rtl"]) {
    // https://github.com/ariakit/ariakit/issues/7590
    test(`keeps a section's links on its own label column behind an icon wider than the line in ${dir}`, async ({
      q,
    }) => {
      const navigation = q.navigation(`Wide icons (${dir})`);
      const nav = query(navigation);
      // Where the label text of a row starts. A link given plain text has no
      // label element, so the text itself is measured. The right edge is
      // negated in RTL, so a larger value sits further from the start edge in
      // both directions.
      const getLabelStart = (row: Locator, label: string) =>
        row.evaluate(
          (node, { labelText, rtl }) => {
            const { ownerDocument } = node;
            const walker = ownerDocument.createTreeWalker(
              node,
              NodeFilter.SHOW_TEXT,
            );
            for (
              let textNode = walker.nextNode();
              textNode;
              textNode = walker.nextNode()
            ) {
              if (textNode.textContent?.trim() !== labelText) continue;
              const range = ownerDocument.createRange();
              range.selectNodeContents(textNode);
              const rect = range.getBoundingClientRect();
              return rtl ? -rect.right : rect.left;
            }
            throw new Error(`No text in the row reads ${labelText}`);
          },
          { labelText: label, rtl: dir === "rtl" },
        );
      await navigation.scrollIntoViewIfNeeded();
      const projects = nav.button("Projects");
      await projects.click();
      await expect(projects).toHaveAttribute("aria-expanded", "true");
      const sections = [
        [projects, "Projects", nav.link("All projects"), "All projects"],
        // A section without an icon leads its label with the start chevron.
        [nav.button("Archive"), "Archive", nav.link("2025"), "2025"],
        [nav.button("Older"), "Older", nav.link("2024"), "2024"],
      ] as const;
      for (const [button, buttonLabel, link, linkLabel] of sections) {
        await expect
          .poll(async () => {
            const [buttonStart, linkStart] = await Promise.all([
              getLabelStart(button, buttonLabel),
              getLabelStart(link, linkLabel),
            ]);
            return linkStart - buttonStart;
          })
          .toBeCloseTo(0, 0);
      }
      // The chevron is narrower than the line, so the label after it keeps the
      // chevron's column rather than the wide icon's, and its links follow it.
      const [iconColumn, chevronColumn] = await Promise.all([
        getLabelStart(projects, "Projects"),
        getLabelStart(nav.button("Archive"), "Archive"),
      ]);
      expect(chevronColumn).toBeLessThan(iconColumn - 1);
    });
  }

  test("places a nonanimated bar at the frame edge or an explicit distance", async ({
    q,
  }) => {
    const nav = q.navigation("Project pages");
    const link = query(nav).link("Overview");
    const bar = nav.locator(".control-bar:visible");
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
    await q.combobox("Bar distance").selectOption("edge");
    await expect
      .poll(async () => (await getBox(bar)).y - (await getBox(nav)).y)
      .toBeCloseTo(0, 0);
    await expect(link).toHaveCSS("border-radius", radius);
    // The navigation scrolls, so it clips a bar past its padding. Without
    // padding, an edge bar overlaps the link's edge and stays in view.
    await q.checkbox("Add frame padding").uncheck();
    await expect(nav).toHaveCSS("padding", "0px");
    for (const side of ["start", "end"]) {
      await q.combobox("Bar side").selectOption(side);
      await expect
        .poll(async () => {
          const [box, item] = await Promise.all([getBox(bar), getBox(link)]);
          return side === "start"
            ? box.y - item.y
            : item.y + item.height - box.y - box.height;
        })
        .toBeCloseTo(0, 0);
      await expect(bar).toBeInViewport({ ratio: 1 });
    }
    const standalone = q.navigation("Single link");
    await expect(standalone.locator(".control-bar:visible")).toBeVisible();
    await expect(query(standalone).link("Home")).toHaveAttribute(
      "aria-current",
      "location",
    );
  });

  test("centers a bar in the frame padding below or above a link", async ({
    q,
  }) => {
    const nav = q.navigation("Project pages");
    const link = query(nav).link("Overview");
    const bar = nav.locator(".control-bar:visible");
    await nav.scrollIntoViewIfNeeded();
    await q.combobox("Bar distance").selectOption("halfway");
    for (const side of ["end", "start"]) {
      await q.combobox("Bar side").selectOption(side);
      await expect
        .poll(async () => {
          const [box, item, bounds] = await Promise.all([
            getBox(bar),
            getBox(link),
            getBox(nav),
          ]);
          const border = await nav.evaluate((node) =>
            Number.parseFloat(getComputedStyle(node).borderTopWidth),
          );
          const toItem =
            side === "start"
              ? item.y - box.y - box.height
              : box.y - item.y - item.height;
          const toFrame =
            side === "start"
              ? box.y - bounds.y - border
              : bounds.y + bounds.height - border - box.y - box.height;
          return [Math.round(toItem), Math.round(toItem - toFrame)];
        })
        .toEqual([5, 0]);
    }
  });

  test("shortens a bar below a link by its corner radius unless the length is full", async ({
    q,
  }) => {
    const nav = q.navigation("Project pages");
    const link = query(nav).link("Overview");
    const bar = nav.locator(".control-bar:visible");
    await nav.scrollIntoViewIfNeeded();
    // Without frame padding, links keep the navigation's rounded corners.
    await q.checkbox("Add frame padding").uncheck();
    const radius = await link.evaluate((node) =>
      Number.parseFloat(getComputedStyle(node).borderTopLeftRadius),
    );
    expect(radius).toBeGreaterThan(0);
    const getInsets = async () => {
      const [box, item] = await Promise.all([getBox(bar), getBox(link)]);
      return {
        start: Math.round(box.x - item.x),
        length: Math.round(item.width - box.width),
      };
    };
    await expect
      .poll(getInsets)
      .toEqual({ start: Math.round(radius / 2), length: Math.round(radius) });
    await q.combobox("Bar length").selectOption("full");
    await expect.poll(getInsets).toEqual({ start: 0, length: 0 });
  });
});
