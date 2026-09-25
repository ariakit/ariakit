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
      capturePage({
        page,
        visual,
        colorScheme,
        item: "ariakit-ui-combobox/page",
      }),
    );
  });

  // https://github.com/ariakit/ariakit/issues/7473
  test("keeps long options inside a narrow viewport @visual", async ({
    page,
    q,
    visual,
  }) => {
    const viewport = { width: 400, height: 800 };
    await page.setViewportSize(viewport);
    await forEachColorScheme(page, async (colorScheme) => {
      for (const [key, name] of [
        ["suggestion", "Long suggestion"],
        ["selection", "Long selection"],
      ] as const) {
        await q.combobox(name).click();
        const list = q.listbox(name);
        await test.expect(list).toBeVisible();
        await visual(
          getCapture(list, colorScheme, {
            item: `ariakit-ui-combobox/narrow-list/${key}`,
            viewports: { mobile: viewport },
          }),
        );
        await page.keyboard.press("Escape");
        await test.expect(list).toBeHidden();
      }
    });
  });

  // https://github.com/ariakit/ariakit/pull/7492#discussion_r3995158957
  // https://github.com/ariakit/ariakit/pull/7492#discussion_r3995167094
  test("aligns custom icons and selected options @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorScheme(page, async (colorScheme) => {
      const select = q.combobox("Notifications");
      await select.click();
      const list = q.listbox("Notifications");
      await test.expect(list).toBeVisible();
      const email = query(list).option("Email");
      const sms = query(list).option("SMS");
      for (const option of [email, sms]) {
        await test
          .expect(option.locator(":scope > :first-child"))
          .toHaveAttribute("aria-hidden", "true");
      }
      await visual(
        getCapture(list, colorScheme, {
          item: "ariakit-ui-combobox/custom-icons/initial",
          clipMargin: OVERLAY_CLIP_MARGIN,
        }),
      );
      await sms.click();
      await test.expect(sms).toHaveAttribute("aria-selected", "true");
      await email.click();
      await test.expect(email).toHaveAttribute("aria-selected", "false");
      await test.expect(select).toHaveText("SMS");
      await visual(
        getCapture(list, colorScheme, {
          item: "ariakit-ui-combobox/custom-icons/selected",
          clipMargin: OVERLAY_CLIP_MARGIN,
        }),
      );
    });
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
      await captureInView({
        visual,
        box: q.article("Status select"),
        colorScheme,
        item: "ariakit-ui-combobox/status-select",
      });
    });
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
        getCapture(list, colorScheme, {
          item: "ariakit-ui-combobox/combobox-list-spacing",
          clipMargin: OVERLAY_CLIP_MARGIN,
        }),
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
        getCapture(list, colorScheme, {
          item: "ariakit-ui-combobox/select-list-spacing",
          clipMargin: OVERLAY_CLIP_MARGIN,
        }),
      );
    });
  });
});
