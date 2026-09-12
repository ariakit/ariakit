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
