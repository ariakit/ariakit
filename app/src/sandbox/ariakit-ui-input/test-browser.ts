import type { Locator } from "@playwright/test";
import {
  captureInView,
  capturePage,
  forEachColorScheme,
  getCapture,
  hoverOver,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";

withCaptures(import.meta.dirname, async ({ query, test }) => {
  // https://github.com/ariakit/ariakit/issues/7477
  test("matches the field and button heights without stretching", async ({
    q,
  }) => {
    const box = query(q.article("Inline form with submit button"));
    const input = box.textbox("Newsletter email");
    const button = box.button("Subscribe");
    await test.expect(input).toBeVisible();
    const buttonBox = await button.boundingBox();
    await test.expect
      .poll(async () => (await input.boundingBox())?.height)
      .toBe(buttonBox?.height);
  });

  // https://github.com/ariakit/ariakit/issues/7477
  test("shares every named control size with buttons", async ({ q }) => {
    const box = query(q.article("Control sizes"));
    for (const size of ["xs", "sm", "md", "lg", "xl"]) {
      const input = box.textbox(`${size} field`);
      const button = box.button(`Save ${size}`);
      const buttonBox = await button.boundingBox();
      await test.expect
        .poll(async () => (await input.boundingBox())?.height)
        .toBe(buttonBox?.height);
      await test
        .expect(input)
        .toHaveCSS(
          "font-size",
          await button.evaluate((node) => getComputedStyle(node).fontSize),
        );
    }
  });

  // https://github.com/ariakit/ariakit/pull/7491#discussion_r3995200392
  test("keeps the size controls inside their card on a narrow screen", async ({
    page,
    q,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const card = q.article("Control sizes");
    const box = query(card);
    const cardBox = await card.boundingBox();
    test.expect(cardBox).not.toBeNull();
    if (!cardBox) return;
    for (const size of ["xs", "sm", "md", "lg", "xl"]) {
      const button = box.button(`Save ${size}`);
      await test.expect
        .poll(async () => {
          const rect = await button.boundingBox();
          return rect && rect.x + rect.width;
        })
        .toBeLessThan(cardBox.x + cardBox.width);
    }
  });

  // https://github.com/ariakit/ariakit/pull/7491#discussion_r3995154902
  test("reads invalid state from a wrapped input", async ({ page, q }) => {
    const field = q.textbox("Filter components");
    const wrapper = field.locator("xpath=..");
    await forEachColorScheme(page, async () => {
      const ordinaryEdge = await wrapper.evaluate((node) =>
        getComputedStyle(node).getPropertyValue("--ak-edge"),
      );
      const dangerEdge = await query(q.article("Invalid"))
        .textbox("Email")
        .evaluate((node) =>
          getComputedStyle(node).getPropertyValue("--ak-edge"),
        );
      await field.evaluate((node) => node.setAttribute("aria-invalid", "true"));
      await test.expect(wrapper).toHaveCSS("--ak-edge", dangerEdge);
      await field.evaluate((node) =>
        node.setAttribute("aria-invalid", "false"),
      );
      await test.expect(wrapper).toHaveCSS("--ak-edge", ordinaryEdge);
    });
  });

  // https://github.com/ariakit/ariakit/issues/7477
  test("keeps fields with slots at the plain field height", async ({ q }) => {
    const inputBox = await q.textbox("Full name").boundingBox();
    const fields = [
      q.textbox("Filter components").locator("xpath=.."),
      q.textbox("Share link").locator("xpath=../.."),
      q.button("Search docs"),
    ];
    for (const field of fields) {
      await test.expect
        .poll(async () => (await field.boundingBox())?.height)
        .toBe(inputBox?.height);
    }
    const copy = q.button("Copy");
    const wrapper = copy.locator("xpath=../..");
    const buttonBox = await copy.boundingBox();
    const wrapperBox = await wrapper.boundingBox();
    test.expect(buttonBox).not.toBeNull();
    test.expect(wrapperBox).not.toBeNull();
    if (!buttonBox) return;
    if (!wrapperBox) return;
    test.expect(buttonBox.x).toBeGreaterThan(wrapperBox.x);
    test
      .expect(buttonBox.x + buttonBox.width)
      .toBeLessThan(wrapperBox.x + wrapperBox.width);
    test.expect(buttonBox.y).toBeGreaterThan(wrapperBox.y);
    test
      .expect(buttonBox.y + buttonBox.height)
      .toBeLessThan(wrapperBox.y + wrapperBox.height);
  });

  // https://github.com/ariakit/ariakit/issues/7477
  test("updates the field edge when aria-invalid changes", async ({
    page,
    q,
  }) => {
    await forEachColorScheme(page, async () => {
      const input = query(q.article("Invalid")).textbox("Email");
      const invalidEdge = await input.evaluate((node) =>
        getComputedStyle(node).getPropertyValue("--ak-edge"),
      );
      // The danger hue must keep its own lightness instead of being pushed to
      // black or white by the ordinary field edge.
      await test.expect(input).toHaveCSS(
        "--ak-edge",
        await input.evaluate((node) => {
          const color = node.ownerDocument.createElement("span");
          color.style.color = "oklch(from var(--color-danger) l c h / 0.45)";
          node.after(color);
          const expected = getComputedStyle(color).color;
          color.remove();
          return expected;
        }),
      );
      await input.evaluate((node) =>
        node.setAttribute("aria-invalid", "false"),
      );
      await test.expect(input).toHaveAttribute("aria-invalid", "false");
      await test.expect
        .poll(() =>
          input.evaluate((node) =>
            getComputedStyle(node).getPropertyValue("--ak-edge"),
          ),
        )
        .not.toBe(invalidEdge);
    });
  });

  // Flips the disabled state the way application code does after render, which
  // is why the recipe draws the disabled look from CSS state instead of a prop.
  const setDisabled = (element: Locator, attribute = "disabled") =>
    element.evaluate((node, name) => {
      node.setAttribute(name, name === "disabled" ? "" : "true");
    }, attribute);

  test("page @visual", async ({ page, visual }) => {
    await forEachColorScheme(page, (colorScheme) =>
      capturePage(page, visual, colorScheme),
    );
  });

  test("rings the wrapper when the input inside takes focus @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorScheme(page, async (colorScheme) => {
      const box = q.article("Field with leading icon");
      const input = query(box).textbox("Filter components");
      await input.click();
      await test.expect(input).toBeFocused();
      await captureInView(visual, box, colorScheme);
    });
  });

  // A disabled field used to compute the same styles as an enabled one, and the
  // label around the input still takes the pointer, so its hover tint has to be
  // turned off by the same disabled state.
  test("dims the wrapper of a disabled input and keeps it unlit on hover @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorScheme(page, async (colorScheme) => {
      const box = q.article("Field with leading icon");
      const input = query(box).textbox("Filter components");
      await setDisabled(input);
      await test.expect(input).toBeDisabled();
      await hoverOver(input.locator("xpath=.."), { x: 4, y: 4 });
      await visual(getCapture(box, colorScheme));
    });
  });

  // The wrapper read only a natively disabled input, so an input that stays
  // focusable with aria-disabled left the wrapper enabled and hoverable.
  test("dims the wrapper of an aria-disabled input and keeps it unlit on hover @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorScheme(page, async (colorScheme) => {
      const box = q.article("Field with leading icon");
      const input = query(box).textbox("Filter components");
      await setDisabled(input, "aria-disabled");
      await test.expect(input).toHaveAttribute("aria-disabled", "true");
      await hoverOver(input.locator("xpath=.."), { x: 4, y: 4 });
      await visual(getCapture(box, colorScheme));
    });
  });

  // A disabled button inside a wrapper, such as a send button that waits for
  // text, must not make the editable field look or behave disabled.
  test("keeps a wrapper enabled and lit on hover when only its button is disabled @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorScheme(page, async (colorScheme) => {
      const box = q.article("Share link with copy button");
      const button = query(box).button("Copy");
      await setDisabled(button);
      await test.expect(button).toBeDisabled();
      await hoverOver(query(box).text("https://"));
      await visual(getCapture(box, colorScheme));
    });
  });

  // A button-type input is a button too, so a disabled submit input must leave
  // the field enabled like a disabled button element does.
  test("keeps a wrapper enabled and lit on hover when only its submit input is disabled @visual", async ({
    page,
    q,
    visual,
  }) => {
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
  });

  // The field stays enabled while any control in it still takes entry, such as
  // a link beside a locked choice of expiry.
  test("keeps a wrapper enabled and lit on hover when only its select is disabled @visual", async ({
    page,
    q,
    visual,
  }) => {
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
  });
});
