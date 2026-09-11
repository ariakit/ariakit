import type { Locator } from "@playwright/test";
import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

function getBackground(card: Locator) {
  return card.evaluate((node) => getComputedStyle(node).backgroundColor);
}

withFramework(
  import.meta.dirname,
  { route: "radio" },
  async ({ test, query }) => {
    test("a card disabled through its grid looks disabled", async ({
      page,
      q,
    }) => {
      // Hovering an enabled card lights it, which is what the disabled grid
      // must not do.
      const enabledCard = query(q.article("Cards"))
        .radio(/^Hobby/)
        .locator("xpath=..");
      const enabledResting = await getBackground(enabledCard);
      await enabledCard.hover();
      await test.expect
        .poll(() => getBackground(enabledCard))
        .not.toBe(enabledResting);

      const box = query(q.article("Disabled card grid"));
      // The card is the label around the hidden input.
      const card = box.radio(/^Hobby/).locator("xpath=..");
      const checkedCard = box.radio(/^Pro/).locator("xpath=..");
      await test.expect(card).toHaveCSS("cursor", "not-allowed");
      await test
        .expect(query(card).text("Hobby"))
        .toHaveCSS("color", / \/ 0?\.\d+\)$/);
      // The checked card drops its tint like the rest of the grid.
      test
        .expect(await getBackground(checkedCard))
        .toBe(await getBackground(card));

      const resting = await getBackground(card);
      await card.hover();
      // Hover paints the background without a transition, so the enabled card
      // above changed by the next frame. Cross that boundary before asserting
      // that the disabled card did not change.
      await flushFrames(page);
      test.expect(await getBackground(card)).toBe(resting);
    });
  },
);
