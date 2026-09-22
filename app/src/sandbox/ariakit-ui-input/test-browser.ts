import type { Locator } from "@playwright/test";
import {
  captureInView,
  capturePage,
  expectFocusVisible,
  forEachColorScheme,
  getCapture,
  hoverOver,
  tabInto,
  tabTo,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";

withCaptures(import.meta.dirname, async ({ query, test }) => {
  for (const clickCount of [2, 3]) {
    // https://github.com/ariakit/ariakit/pull/7491#discussion_r4001553443
    test(`preserves group prefix selection from ${clickCount} clicks`, async ({
      page,
      q,
    }) => {
      const prefix = q.text("https://", { exact: true });
      const field = q.textbox("Share link");
      await prefix.click({ clickCount, position: { x: 10, y: 10 } });
      await test.expect
        .poll(() => page.evaluate(() => getSelection()?.toString().trim()))
        .toBe(clickCount === 2 ? "https" : "https://");
      await test.expect(field).not.toBeFocused();
      await prefix.click();
      await test.expect(field).toBeFocused();
    });
  }

  // https://github.com/ariakit/ariakit/pull/7491#discussion_r4001553443
  test("preserves text selected by dragging across a group prefix", async ({
    page,
    q,
  }) => {
    const prefix = q.text("https://", { exact: true });
    const field = q.textbox("Share link");
    // Keep the drag away from viewport edges that trigger selection scrolling.
    await prefix.evaluate((node) => node.scrollIntoView({ block: "center" }));
    const box = await prefix.boundingBox();
    test.expect(box).not.toBeNull();
    if (!box) return;
    await page.mouse.move(box.x + 1, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width - 1, box.y + box.height / 2, {
      steps: 12,
    });
    await test.expect
      .poll(() => page.evaluate(() => getSelection()?.toString()))
      .toBe("https://");
    await page.mouse.up();
    await test.expect
      .poll(() => page.evaluate(() => getSelection()?.toString()))
      .toBe("https://");
    await test.expect(field).not.toBeFocused();
    await prefix.click();
    await test.expect(field).toBeFocused();
  });

  // https://github.com/ariakit/ariakit/pull/7491#discussion_r4001176828
  test("skips a leading action when focusing the field from group padding", async ({
    q,
  }) => {
    const field = q.textbox("Draft message");
    await field.locator("xpath=..").click({ position: { x: 4, y: 4 } });
    await test.expect(field).toBeFocused();
    await q.button("Clear").click();
    await test.expect(q.button("Clear")).toBeFocused();
    await test.expect(field).not.toBeFocused();
  });

  // https://github.com/ariakit/ariakit/pull/7491#discussion_r3997757472
  test("focuses the share link from the padded field surface", async ({
    q,
  }) => {
    const input = q.textbox("Share link");
    const field = input.locator("xpath=../..");
    const copy = q.button("Copy");
    const box = await field.boundingBox();
    test.expect(box).not.toBeNull();
    if (!box) return;
    for (const position of [
      { x: box.width / 2, y: 2 },
      { x: box.width / 2, y: box.height - 2 },
      { x: 2, y: box.height / 2 },
    ]) {
      await copy.click();
      await test.expect(copy).toBeFocused();
      await field.click({ position });
      await test.expect(input).toBeFocused();
    }
    await copy.click();
    await test.expect(copy).toBeFocused();
    await test.expect(input).not.toBeFocused();
  });

  // Flips the disabled state the way application code does after render, which
  // is why the recipe draws the disabled look from CSS state instead of a prop.
  const setDisabled = (element: Locator, attribute = "disabled") =>
    element.evaluate((node, name) => {
      node.setAttribute(name, name === "disabled" ? "" : "true");
    }, attribute);

  test(
    "page @visual",
    { annotation: { type: "ariviso:item", description: "ui/input/page" } },
    async ({ page, visual }) => {
      await forEachColorScheme(page, (colorScheme) =>
        capturePage(page, visual, colorScheme),
      );
    },
  );

  // https://github.com/ariakit/ariakit/pull/7491#discussion_r4001152364
  // https://github.com/ariakit/ariakit/pull/7491#discussion_r4001360186
  test(
    "rings grouped fields and their leading actions on keyboard focus @visual",
    {
      annotation: {
        type: "ariviso:item",
        description:
          "ui/input/rings-grouped-fields-and-their-leading-actions-on-keyboard-focus",
      },
    },
    async ({ page, q, visual }) => {
      await forEachColorScheme(page, async (colorScheme) => {
        const box = q.article("Field with leading reset button");
        await tabInto(page, box);
        await expectFocusVisible(q.button("Clear"));
        await captureInView(visual, box, colorScheme, {
          id: "action",
          capture: "action",
        });
        await page.keyboard.press("Tab");
        await expectFocusVisible(q.textbox("Draft message"));
        await captureInView(visual, box, colorScheme, {
          id: "field",
          capture: "field",
        });
        for (const { capture, field } of [
          { capture: "delivery-notes", field: q.textbox("Delivery notes") },
          { capture: "delivery-speed", field: q.combobox("Delivery speed") },
          { capture: "handle", field: q.textbox("Handle") },
        ]) {
          await tabTo(page, field);
          await expectFocusVisible(field);
          await captureInView(visual, field.locator(".."), colorScheme, {
            capture,
          });
        }
      });
    },
  );

  test(
    "rings the wrapper when the input inside takes focus @visual",
    {
      annotation: {
        type: "ariviso:item",
        description:
          "ui/input/rings-the-wrapper-when-the-input-inside-takes-focus",
      },
    },
    async ({ page, q, visual }) => {
      await forEachColorScheme(page, async (colorScheme) => {
        const box = q.article("Field with leading icon");
        const input = query(box).textbox("Filter components");
        await input.click();
        await test.expect(input).toBeFocused();
        await captureInView(visual, box, colorScheme);
      });
    },
  );

  // A disabled field used to compute the same styles as an enabled one, and the
  // label around the input still takes the pointer, so its hover tint has to be
  // turned off by the same disabled state.
  test(
    "dims the wrapper of a disabled input and keeps it unlit on hover @visual",
    {
      annotation: {
        type: "ariviso:item",
        description:
          "ui/input/dims-the-wrapper-of-a-disabled-input-and-keeps-it-unlit-on-hover",
      },
    },
    async ({ page, q, visual }) => {
      await forEachColorScheme(page, async (colorScheme) => {
        const box = q.article("Field with leading icon");
        const input = query(box).textbox("Filter components");
        await setDisabled(input);
        await test.expect(input).toBeDisabled();
        await hoverOver(input.locator("xpath=.."), { x: 4, y: 4 });
        await visual(getCapture(box, colorScheme));
      });
    },
  );

  // The wrapper read only a natively disabled input, so an input that stays
  // focusable with aria-disabled left the wrapper enabled and hoverable.
  test(
    "dims the wrapper of an aria-disabled input and keeps it unlit on hover @visual",
    {
      annotation: {
        type: "ariviso:item",
        description:
          "ui/input/dims-the-wrapper-of-an-aria-disabled-input-and-keeps-it-unlit-on-hover",
      },
    },
    async ({ page, q, visual }) => {
      await forEachColorScheme(page, async (colorScheme) => {
        const box = q.article("Field with leading icon");
        const input = query(box).textbox("Filter components");
        await setDisabled(input, "aria-disabled");
        await test.expect(input).toHaveAttribute("aria-disabled", "true");
        await hoverOver(input.locator("xpath=.."), { x: 4, y: 4 });
        await visual(getCapture(box, colorScheme));
      });
    },
  );

  // A disabled button inside a wrapper, such as a send button that waits for
  // text, must not make the editable field look or behave disabled.
  test(
    "keeps a wrapper enabled and lit on hover when only its button is disabled @visual",
    {
      annotation: {
        type: "ariviso:item",
        description:
          "ui/input/keeps-a-wrapper-enabled-and-lit-on-hover-when-only-its-button-is-disabled",
      },
    },
    async ({ page, q, visual }) => {
      await forEachColorScheme(page, async (colorScheme) => {
        const box = q.article("Share link with copy button");
        const button = query(box).button("Copy");
        await setDisabled(button);
        await test.expect(button).toBeDisabled();
        await hoverOver(query(box).text("https://"));
        await visual(getCapture(box, colorScheme));
      });
    },
  );

  // A button-type input is a button too, so a disabled submit input must leave
  // the field enabled like a disabled button element does.
  test(
    "keeps a wrapper enabled and lit on hover when only its submit input is disabled @visual",
    {
      annotation: {
        type: "ariviso:item",
        description:
          "ui/input/keeps-a-wrapper-enabled-and-lit-on-hover-when-only-its-submit-input-is-disabled",
      },
    },
    async ({ page, q, visual }) => {
      await forEachColorScheme(page, async (colorScheme) => {
        const box = q.article("Share link with copy button");
        await query(box)
          .button("Copy")
          .evaluate((node) => {
            const submit = document.createElement("input");
            submit.type = "submit";
            submit.value = "Send";
            submit.disabled = true;
            node.after(submit);
          });
        await test.expect(query(box).button("Send")).toBeDisabled();
        await hoverOver(query(box).text("https://"));
        await visual(getCapture(box, colorScheme));
      });
    },
  );

  // The field stays enabled while any control in it still takes entry, such as
  // a link beside a locked choice of expiry.
  test(
    "keeps a wrapper enabled and lit on hover when only its select is disabled @visual",
    {
      annotation: {
        type: "ariviso:item",
        description:
          "ui/input/keeps-a-wrapper-enabled-and-lit-on-hover-when-only-its-select-is-disabled",
      },
    },
    async ({ page, q, visual }) => {
      await forEachColorScheme(page, async (colorScheme) => {
        const box = q.article("Share link with copy button");
        await query(box)
          .button("Copy")
          .evaluate((node) => {
            const select = document.createElement("select");
            select.setAttribute("aria-label", "Expiry");
            select.disabled = true;
            select.append(new Option("7 days"));
            node.before(select);
          });
        await test.expect(query(box).combobox("Expiry")).toBeDisabled();
        await hoverOver(query(box).text("https://"));
        await visual(getCapture(box, colorScheme));
      });
    },
  );
});
