import {
  capturePage,
  forEachColorScheme,
  getBadgeHeight,
  getCapsOffset,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";
import { setVisonautItem } from "#app/test-utils/visonaut.ts";

withCaptures(import.meta.dirname, async ({ query, test }) => {
  // Each engine rounds the half-leading of a line box its own way, so the label
  // text centers only once its box is trimmed to the capitals.
  // https://github.com/ariakit/ariakit/issues/7592
  test("centers the label text in the badge", async ({ q }) => {
    const label = query(q.article("Default")).text("Draft");
    await test.expect(label).toBeVisible();
    test.expect(await getCapsOffset(label)).toBeCloseTo(0, 1);
  });

  // A label with overflow: hidden is a scroll container, which Firefox does not
  // trim, so the padding that gives back the trimmed room would make the badge
  // taller.
  // https://github.com/ariakit/ariakit/issues/7592
  test("centers a truncated label at the height of one line", async ({ q }) => {
    const label = query(q.article("Truncated label")).text(
      "Waiting for review from the design team",
    );
    const draft = query(q.article("Default")).text("Draft");
    await test.expect(label).toBeVisible();
    test.expect(await getCapsOffset(label)).toBeCloseTo(0, 1);
    test.expect(await getBadgeHeight(label)).toBe(await getBadgeHeight(draft));
  });

  test("page @visual", async ({ page, visual }) => {
    setVisonautItem("ui/badge/test-browser/page");
    await forEachColorScheme(page, (colorScheme) =>
      capturePage(page, visual, colorScheme),
    );
  });
});
