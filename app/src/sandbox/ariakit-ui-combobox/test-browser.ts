import type { Locator } from "@playwright/test";
import {
  captureInView,
  capturePage,
  forEachColorScheme,
  getCapture,
  OVERLAY_CLIP_MARGIN,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";

withCaptures(import.meta.dirname, async ({ query, test }) => {
  // The fixture section sits at the end of the sandbox, so it is scrolled to
  // the top of the viewport first: the lists then have room to open below their
  // anchors instead of flipping above them.
  const scrollToTop = (section: Locator) =>
    section.evaluate((node) => {
      node.scrollIntoView({ block: "start" });
    });

  // The page capture covers the select sizes and static thumbnail highlight.
  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3972223972
  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3974550839
  test("page @visual", async ({ page, visual }) => {
    await forEachColorScheme(page, (colorScheme) =>
      capturePage(page, visual, colorScheme),
    );
  });

  test("colors the status select with the chosen status @visual", async ({
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
      await captureInView(visual, q.article("Status select"), colorScheme);
    });
  });

  test("keeps space between the search field and its list", async ({ q }) => {
    for (const [articleName, inputName, listName] of [
      ["Searchable select", "Search timezones", "Timezone"],
      ["Scrollable search", "Search shipping countries", "Shipping country"],
    ] as const) {
      const article = query(q.article(articleName));
      const input = article.combobox(inputName);
      const list = article.listbox(listName);
      await test.expect(input).toBeVisible();
      await test.expect(list).toBeVisible();
      const inputBox = await input.boundingBox();
      const listBox = await list.boundingBox();
      if (!inputBox || !listBox) {
        throw new Error("The search field or its list has no bounding box");
      }
      test.expect(listBox.y).toBeGreaterThan(inputBox.y + inputBox.height);
    }
  });

  test("scrolls the search results while the field stays in place", async ({
    page,
    q,
  }) => {
    const article = query(q.article("Scrollable search"));
    const input = article.combobox("Search shipping countries");
    const list = article.listbox("Shipping country");
    await list.hover();
    const inputBox = await input.boundingBox();
    await page.mouse.wheel(0, 400);
    await test.expect
      .poll(() => list.evaluate((element) => element.scrollTop))
      .toBeGreaterThan(0);
    await test.expect(input).toBeVisible();
    const scrolledInputBox = await input.boundingBox();
    if (!inputBox || !scrolledInputBox) {
      throw new Error("The search field has no bounding box");
    }
    test.expect(scrolledInputBox.y).toBeCloseTo(inputBox.y);
    await input.fill("Norway");
    await test.expect(query(list).option()).toHaveCount(1);
    await test.expect(query(list).option("Norway")).toBeVisible();
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
