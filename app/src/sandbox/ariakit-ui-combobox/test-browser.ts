import type { Locator } from "@playwright/test";
import {
  captureInView,
  capturePage,
  expectMedia,
  forEachColorScheme,
  forEachColorSchemeOf,
  getCapture,
  hoverOver,
  OVERLAY_CLIP_MARGIN,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";
import type { ColorScheme } from "#app/test-utils/ariakit-ui.ts";
import { flushFrames } from "#app/test-utils/preview.ts";

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
    const capture = (colorScheme: ColorScheme) =>
      capturePage({
        page,
        visual,
        colorScheme,
        item: "ariakit-ui-combobox/page",
      });
    await forEachColorScheme(page, capture);
    // The forced-colors variant of the same capture. The lists held open have
    // no focus, so no option shows the selection colors.
    // https://github.com/ariakit/ariakit/issues/7871
    await page.emulateMedia({ forcedColors: "active" });
    await forEachColorScheme(page, async (colorScheme) => {
      await expectMedia(page, "(forced-colors: active)");
      await capture(colorScheme);
    });
  });

  // The highlight follows current focus, so each card is captured while its
  // input has focus and the pointer is over an option.
  // https://github.com/ariakit/ariakit/issues/7875
  test("highlights the option with current focus @visual", async ({
    page,
    q,
    visual,
  }) => {
    const capture = async (colorScheme: ColorScheme) => {
      for (const [key, title, inputName, optionName] of [
        ["suggestion", "Open suggestions", "Snack", "Cashews"],
        ["disabled", "Disabled active option", "Nut butter", "Peanut"],
        [
          "reference",
          "combobox-item-highlight",
          "Reference search",
          "Reference highlight",
        ],
      ] as const) {
        const box = q.article(title);
        await box.evaluate((node) => {
          node.scrollIntoView({ block: "center" });
        });
        // The scroll event arrives on a later frame and resets Ariakit's
        // mouse-movement tracker, which would make the option ignore the hover
        // below, so let it fire first.
        await flushFrames(page);
        // A click clears the default active option. The hover then gives the
        // option the pointer highlight instead of the keyboard focus style.
        await query(box).combobox(inputName).click();
        const option = query(box).option(optionName);
        await hoverOver(option);
        await test.expect(option).toHaveAttribute("data-focus", "true");
        await test.expect(option).not.toHaveAttribute("data-focus-visible");
        await visual(
          getCapture(box, colorScheme, {
            item: `ariakit-ui-combobox/focused-option/${key}`,
          }),
        );
      }
    };
    const examples = [
      "Open suggestions",
      "Disabled active option",
      "combobox-item-highlight",
    ];
    await forEachColorSchemeOf(page, examples, capture);
    // The forced-colors variant of the same captures. The option with focus
    // uses the system selection colors, also when it is disabled.
    // https://github.com/ariakit/ariakit/issues/7518
    // https://github.com/ariakit/ariakit/issues/7871
    await page.emulateMedia({ forcedColors: "active" });
    await forEachColorSchemeOf(page, examples, async (colorScheme) => {
      await expectMedia(page, "(forced-colors: active)");
      await capture(colorScheme);
    });
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
    await forEachColorSchemeOf(page, ["Status select"], async (colorScheme) => {
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
