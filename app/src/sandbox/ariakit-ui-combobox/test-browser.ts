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

  // https://github.com/ariakit/ariakit/pull/7492#discussion_r3995158957
  // https://github.com/ariakit/ariakit/pull/7492#discussion_r3995167094
  test("keeps custom icon sizes and aligns selected and unselected items", async ({
    q,
  }) => {
    const expectIconCentered = async (row: Locator) => {
      const offset = await row.evaluate((element) => {
        const svg = element.querySelector("svg");
        const textNode =
          element.getAttribute("role") === "combobox"
            ? element.firstChild
            : element.lastElementChild;
        if (!svg || !textNode) {
          throw new Error("The row has no icon or label");
        }
        const range = element.ownerDocument.createRange();
        range.selectNodeContents(textNode);
        const text = range.getBoundingClientRect();
        const icon = svg.getBoundingClientRect();
        return Math.abs(icon.y + icon.height / 2 - text.y - text.height / 2);
      });
      test.expect(offset).toBeLessThan(1);
    };
    const select = q.combobox("Notifications");
    const arrow = select.locator(":scope > [aria-hidden]");
    await test.expect(arrow).toHaveCSS("width", "32px");
    await test.expect(arrow).toHaveCSS("height", "24px");
    await test.expect(arrow.locator("svg")).toBeVisible();
    await expectIconCentered(select);
    await select.click();
    const list = query(q.listbox("Notifications"));
    const email = list.option("Email");
    const sms = list.option("SMS");
    const emailCheck = email.locator(":scope > :first-child");
    const smsCheck = sms.locator(":scope > :first-child");
    for (const check of [emailCheck, smsCheck]) {
      await test.expect(check).toHaveAttribute("aria-hidden", "true");
      await test.expect(check).toHaveCSS("width", "32px");
      await test.expect(check).toHaveCSS("height", "24px");
      await test.expect(check).toHaveCSS("pointer-events", "none");
    }
    await test.expect(emailCheck.locator("svg")).toBeVisible();
    await expectIconCentered(email);
    await test.expect(smsCheck).toBeHidden();
    // Wait for the scale transition to end before comparing subpixel positions.
    await test.expect(q.listbox("Notifications")).toHaveCSS("scale", "none");
    const labelPositions = await q
      .listbox("Notifications")
      .locator("[role=option] > :last-child")
      .evaluateAll((labels) =>
        labels.map((label) => label.getBoundingClientRect().x),
      );
    test.expect(labelPositions).toHaveLength(2);
    test.expect(labelPositions[0]).toBe(labelPositions[1]);
    await sms.click();
    await test.expect(sms).toHaveAttribute("aria-selected", "true");
    await test.expect(smsCheck.locator("svg")).toBeVisible();
    await expectIconCentered(sms);
    await email.click();
    await test.expect(email).toHaveAttribute("aria-selected", "false");
    await test.expect(emailCheck).toBeHidden();
    await test.expect(select).toHaveText("SMS");
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
