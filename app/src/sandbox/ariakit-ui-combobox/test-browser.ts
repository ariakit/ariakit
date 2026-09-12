import type { Locator } from "@playwright/test";
import {
  captureInView,
  capturePage,
  forEachColorScheme,
  getCapture,
  OVERLAY_CLIP_MARGIN,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";

function textHeight(element: Element) {
  const range = element.ownerDocument.createRange();
  range.selectNodeContents(element);
  return range.getBoundingClientRect().height;
}

withCaptures(import.meta.dirname, async ({ query, test }) => {
  // https://github.com/ariakit/ariakit/pull/7489#discussion_r3996544068
  test("keeps initials at the label text size in two-row avatars", async ({
    q,
  }) => {
    const example = query(q.article("Custom items"));
    for (const [initials, name] of [
      ["AT", "Ava Thompson"],
      ["NP", "Noah Patel"],
    ] as const) {
      const avatar = example.text(initials);
      const label = example.text(name);
      await test.expect(avatar).toBeVisible();
      await test.expect(label).toBeVisible();
      await test.expect
        .poll(async () => {
          const avatarHeight = await avatar.evaluate(textHeight);
          const labelHeight = await label.evaluate(textHeight);
          return Math.abs(avatarHeight - labelHeight);
        })
        .toBeLessThan(1);
    }
  });

  // https://github.com/ariakit/ariakit/issues/7473
  test("uses placeholder ink for an empty select", async ({ q }) => {
    const placeholderColor = await q
      .combobox("Destination")
      .evaluate((node) => getComputedStyle(node, "::placeholder").color);
    await test
      .expect(q.text("Choose a region", { exact: true }))
      .toHaveCSS("color", placeholderColor);
  });

  // https://github.com/ariakit/ariakit/issues/7473
  test("inherits layer text color on both field labels", async ({ q }) => {
    const section = query(q.article("Field boundaries"));
    const color = await section
      .text("Long suggestion", { exact: true })
      .evaluate((node) => getComputedStyle(node).color);
    await test
      .expect(section.text("Long selection", { exact: true }))
      .toHaveCSS("color", color);
  });

  for (const width of [400, 180]) {
    // https://github.com/ariakit/ariakit/issues/7473
    test(`keeps long suggestions and select options inside a ${width}px viewport`, async ({
      page,
      q,
    }) => {
      await page.setViewportSize({ width, height: 800 });
      for (const name of ["Long suggestion", "Long selection"]) {
        const anchor = q.combobox(name);
        if (width === 180) {
          await test.expect
            .poll(() =>
              anchor.evaluate((node) => node.getBoundingClientRect().width),
            )
            .toBeGreaterThan(width);
        }
        await anchor.click();
        const list = q.listbox(name);
        await test
          .expect(
            query(list).option(
              "international-shipping-region-with-an-unbreakable-identifier",
            ),
          )
          .toBeVisible();
        await test.expect
          .poll(() =>
            list.evaluate((node) => node.getBoundingClientRect().right),
          )
          .toBeLessThanOrEqual(width);
        await test.expect
          .poll(() =>
            list.evaluate((node) => node.getBoundingClientRect().left),
          )
          .toBeGreaterThanOrEqual(0);
        await page.keyboard.press("Escape");
        await test.expect(list).toBeHidden();
      }
    });
  }
  // The fixture section sits at the end of the sandbox, so it is scrolled to
  // the top of the viewport first: the lists then have room to open below their
  // anchors instead of flipping above them.
  const scrollToTop = (section: Locator) =>
    section.evaluate((node) => {
      node.scrollIntoView({ block: "start" });
    });

  // The page capture also keeps the static states of the combobox fixtures
  // under visual regression: the badge size and the static thumbnail highlight.
  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3972223972
  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3974550839
  test("page @visual", async ({ page, visual }) => {
    await forEachColorScheme(page, (colorScheme) =>
      capturePage(page, visual, colorScheme),
    );
  });

  test("colors the badge select with the chosen status @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorScheme(page, async (colorScheme) => {
      const select = q.combobox("Review status");
      await select.click();
      await q.option("Published").click();
      await test.expect(select).toHaveText("Published");
      await test.expect(q.listbox("Review status")).toBeHidden();
      await captureInView(visual, q.article("Badge select"), colorScheme);
    });
  });

  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3972224343
  test("keeps the combobox list spacing with optional position props @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorScheme(page, async (colorScheme) => {
      await scrollToTop(q.region("Project editor"));
      await q.combobox("Assignee").click();
      const list = q.listbox("Assignee");
      await test.expect(list).toBeVisible();
      await visual(
        getCapture(list, colorScheme, { clipMargin: OVERLAY_CLIP_MARGIN }),
      );
    });
  });

  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3972224343
  test("keeps the select list spacing with optional position props @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorScheme(page, async (colorScheme) => {
      await scrollToTop(q.region("Project editor"));
      await q.combobox("Status").click();
      const list = q.listbox("Status");
      await test.expect(list).toBeVisible();
      await visual(
        getCapture(list, colorScheme, { clipMargin: OVERLAY_CLIP_MARGIN }),
      );
    });
  });
});
