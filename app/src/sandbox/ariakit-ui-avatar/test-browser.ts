import type { Locator } from "@playwright/test";
import { expect } from "@playwright/test";
import {
  capturePage,
  captureInView,
  expectFocusVisible,
  forEachColorScheme,
  tabTo,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";
import { getBox } from "../ariakit-ui-shell/test-helpers.ts";

function getLineHeight(element: Locator) {
  return element.evaluate((node) =>
    Number.parseFloat(getComputedStyle(node).lineHeight),
  );
}

function getFontSize(element: Locator) {
  return element.evaluate((node) =>
    Number.parseFloat(getComputedStyle(node).fontSize),
  );
}

/** Waits until the element is a square with sides of `size` pixels. */
async function expectSquare(element: Locator, size: number) {
  await expect
    .poll(async () => {
      const box = await getBox(element);
      return [box.width, box.height];
    })
    .toEqual([expect.closeTo(size, 0), expect.closeTo(size, 0)]);
}

/** Returns the width of the text of an avatar, without the avatar box. */
function getTextWidth(avatar: Locator) {
  return avatar.evaluate((node) => {
    const range = node.ownerDocument.createRange();
    range.selectNodeContents(node);
    return range.getBoundingClientRect().width;
  });
}

withCaptures(import.meta.dirname, async ({ query, test }) => {
  test("takes two lines of the text around it by default", async ({ q }) => {
    const box = query(q.article("Default"));
    const lineHeight = await getLineHeight(box.text("Hana Kobayashi"));
    await expectSquare(box.text("HK"), lineHeight * 2);
  });

  test("follows the font size with a number size", async ({ q }) => {
    const avatars = query(q.article("Size follows text")).text("HK");
    // The default size is two lines, so it grows with the text.
    await expectSquare(
      avatars.nth(0),
      (await getLineHeight(avatars.nth(0))) * 2,
    );
    await expectSquare(
      avatars.nth(1),
      (await getLineHeight(avatars.nth(1))) * 2,
    );
    // $size={8} is eight spacing steps, which is two times the font size.
    await expectSquare(avatars.nth(2), (await getFontSize(avatars.nth(2))) * 2);
  });

  test("fits the initials inside the avatar at each size", async ({ q }) => {
    const avatars = [
      ...(await query(q.article("Sizes")).text("HK").all()),
      query(q.article("Initials")).text("WW"),
      query(q.article("Initials")).text("+12"),
    ];
    for (const avatar of avatars) {
      const { width } = await getBox(avatar);
      const textWidth = await getTextWidth(avatar);
      expect(textWidth).toBeGreaterThan(0);
      expect(textWidth).toBeLessThan(width);
    }
  });

  // The photo is an SVG with only a viewBox. A failed image has a natural width
  // of 0, so the photo must not report 0 in any engine.
  test("keeps a loaded SVG photo", async ({ q }) => {
    // The photo is decorative, so it has no role to query.
    const photos = query(q.article("Photo")).img("Maya Rivera").locator("img");
    await expect(photos).toHaveCount(1);
    await expect
      .poll(() =>
        photos.evaluate((image: HTMLImageElement) => [
          image.complete,
          image.naturalWidth > 0,
        ]),
      )
      .toEqual([true, true]);
  });

  test("keeps the line height of running text", async ({ q }) => {
    const paragraph = query(q.article("In running text")).text(/^Assigned to/);
    const lineHeight = await getLineHeight(paragraph);
    await expectSquare(query(paragraph).text("HK"), lineHeight);
    await expect
      .poll(async () => (await getBox(paragraph)).height)
      .toBeCloseTo(lineHeight, 0);
  });

  test("fills the height of a box slot", async ({ q }) => {
    const box = query(q.article("In a control"));
    const lineHeight = await getLineHeight(box.text("Maya Rivera"));
    await expectSquare(box.text("MR"), lineHeight);
    // A full slot takes the height of the button.
    const button = await getBox(box.button("Noah Patel"));
    await expectSquare(box.text("NP"), button.height);
  });

  for (const [title, name] of [
    ["Group", "Project members"],
    ["Group with wrapped avatars", "Wrapped members"],
    ["Group in right-to-left text", "Right-to-left members"],
  ] as const) {
    test(`overlaps the avatars of a group: ${title}`, async ({ q }) => {
      const group = query(q.article(title)).group(name);
      const rtl = title === "Group in right-to-left text";
      const boxes = [];
      for (const initials of ["HK", "TB", "RD", "OW"]) {
        boxes.push(await getBox(query(group).text(initials)));
      }
      for (const [index, box] of boxes.entries()) {
        const previous = boxes[index - 1];
        if (!previous) continue;
        expect(box.width).toBeCloseTo(previous.width, 0);
        // Each avatar starts inside the one before it and ends after it.
        const gap = rtl
          ? previous.x - (box.x + box.width)
          : box.x - (previous.x + previous.width);
        expect(gap).toBeLessThan(0);
        expect(Math.abs(gap)).toBeLessThan(box.width / 2);
      }
    });
  }

  test("sets the size of the avatars in a group", async ({ q }) => {
    const box = query(q.article("Group sizes"));
    // A size step is a quarter of the font size.
    const step = (await getFontSize(box.group("Small group"))) / 4;
    await expectSquare(query(box.group("Small group")).text("HK"), step * 7);
    await expectSquare(query(box.group("Large group")).text("HK"), step * 14);
    // An avatar with its own size keeps it.
    const mixed = query(box.group("Mixed group"));
    await expectSquare(mixed.text("HK"), step * 8);
    await expectSquare(mixed.text("TB"), step * 12);
  });

  test("page @visual", async ({ page, visual }) => {
    await forEachColorScheme(page, (colorScheme) =>
      capturePage({
        page,
        visual,
        colorScheme,
        item: "ariakit-ui-avatar/page",
      }),
    );
  });

  test("draws the focus ring of a link avatar over the next avatar @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorScheme(page, async (colorScheme) => {
      const box = q.article("Group of links");
      const link = query(box).link("Tom Becker");
      await tabTo(page, link);
      await expectFocusVisible(link);
      await captureInView({
        visual,
        box,
        colorScheme,
        item: "ariakit-ui-avatar/group-focus",
      });
    });
  });
});
