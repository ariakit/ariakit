import type { Locator } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

interface OklchColor {
  lightness: number;
  chroma: number;
  hue: number;
  alpha: number;
}

// Engines print a computed oklch() color with different precision, so tests
// compare its channels instead of the exact string.
function parseOklch(value: string): OklchColor {
  const match = value.match(
    /^oklch\(([\d.]+) ([\d.]+) ([\d.]+)(?: \/ ([\d.]+))?\)$/,
  );
  if (!match) {
    throw new Error(`Expected an oklch() color, got ${value}`);
  }
  const [, lightness, chroma, hue, alpha] = match;
  return {
    lightness: Number(lightness),
    chroma: Number(chroma),
    hue: Number(hue),
    alpha: alpha == null ? 1 : Number(alpha),
  };
}

async function getStyle(element: Locator, property: string) {
  return element.evaluate(
    (node, name) => getComputedStyle(node).getPropertyValue(name),
    property,
  );
}

async function getColor(element: Locator, property: string) {
  return parseOklch(await getStyle(element, property));
}

// The painted surface behind an element: the background of the nearest ancestor
// that paints one.
async function getSurfaceColor(element: Locator) {
  return element.evaluate((node) => {
    let parent = node.parentElement;
    while (parent) {
      const { backgroundColor } = getComputedStyle(parent);
      if (backgroundColor !== "rgba(0, 0, 0, 0)") return backgroundColor;
      parent = parent.parentElement;
    }
    return "";
  });
}

// Flips the disabled state the way application code does after render, which is
// why the recipe draws the disabled look from CSS state instead of a prop.
async function setDisabled(element: Locator) {
  await element.evaluate((node) => {
    node.setAttribute("disabled", "");
  });
}

withFramework(
  import.meta.dirname,
  { route: "input" },
  async ({ test, query }) => {
    test("draws the edge at the weight that keeps a field visible", async ({
      q,
    }) => {
      const field = query(q.article("Default")).textbox("Full name");
      const edge = await getColor(field, "border-top-color");
      test.expect(edge.alpha).toBeCloseTo(0.45, 2);
    });

    // A disabled field used to compute the same styles as an enabled one.
    test("dims a disabled field and lays it flat on the surface", async ({
      q,
    }) => {
      const enabled = query(q.article("Default")).textbox("Full name");
      const disabled = query(q.article("Disabled")).textbox("Username");
      await test.expect(disabled).toBeDisabled();
      await test.expect(disabled).toHaveCSS("cursor", "not-allowed");

      const edge = await getColor(disabled, "border-top-color");
      test.expect(edge.alpha).toBeCloseTo(0.1, 2);
      const ink = await getColor(disabled, "color");
      test.expect(ink.alpha).toBeLessThan(0.6);
      test
        .expect(await getStyle(disabled, "background-color"))
        .toBe(await getSurfaceColor(disabled));

      await test.expect(enabled).toHaveCSS("cursor", "text");
      test.expect((await getColor(enabled, "color")).alpha).toBe(1);
      test
        .expect(await getStyle(enabled, "background-color"))
        .not.toBe(await getSurfaceColor(enabled));
    });

    test("reads the disabled state of the input inside a wrapper", async ({
      page,
      q,
    }) => {
      const box = query(q.article("Field with leading icon"));
      const input = box.textbox("Filter components");
      const wrapper = input.locator("xpath=..");
      await test.expect(wrapper).toHaveCSS("cursor", "text");

      await setDisabled(input);
      await test.expect(wrapper).toHaveCSS("cursor", "not-allowed");
      await test.expect(input).toHaveCSS("cursor", "not-allowed");
      const edge = await getColor(wrapper, "border-top-color");
      test.expect(edge.alpha).toBeCloseTo(0.1, 2);
      const ink = await getColor(input, "color");
      test.expect(ink.alpha).toBeLessThan(0.6);

      // The label around the input still takes the pointer, so its hover tint
      // has to be turned off by the same disabled state.
      const resting = await getStyle(wrapper, "background-color");
      await wrapper.hover({ position: { x: 4, y: 4 } });
      // The tint would ease in over the default 150ms transition, and the
      // assertion is that it never starts, so wait past that duration.
      await page.waitForTimeout(200);
      test.expect(await getStyle(wrapper, "background-color")).toBe(resting);
    });

    // A disabled button inside a wrapper, such as a send button that waits for
    // text, must not make the editable field look or behave disabled.
    test("keeps a wrapper enabled when only its button is disabled", async ({
      q,
    }) => {
      const field = query(q.article("Default")).textbox("Full name");
      const box = query(q.article("Share link with copy button"));
      const input = box.textbox("Share link");
      const button = box.button("Copy");
      const wrapper = button.locator("xpath=..");
      const resting = await getStyle(wrapper, "background-color");

      await setDisabled(button);
      await test.expect(button).toBeDisabled();
      await test.expect(wrapper).toHaveCSS("cursor", "text");
      // WebKit reports the native input's own cursor as auto, which still draws
      // the text cursor over it.
      await test.expect(input).not.toHaveCSS("cursor", "not-allowed");
      test.expect((await getColor(input, "color")).alpha).toBe(1);
      test
        .expect(await getStyle(wrapper, "border-top-color"))
        .toBe(await getStyle(field, "border-top-color"));

      await box.text("https://").hover();
      await test.expect(wrapper).not.toHaveCSS("background-color", resting);
    });

    // The recipe's one-line row gave every textarea row a line height equal to
    // the font size.
    test("gives the rows of a textarea the ordinary line height", async ({
      q,
    }) => {
      const textarea = query(q.article("Textarea")).textbox("Notes");
      await test.expect(textarea).toHaveCSS("font-size", "16px");
      await test.expect(textarea).toHaveCSS("line-height", "24px");
    });

    // The default edge push used to move a named edge color to black in light
    // mode and to white in dark mode, which removed its hue.
    test("paints the danger edge in its own color in both themes", async ({
      page,
      q,
    }) => {
      const plain = query(q.article("Default")).textbox("Full name");
      const field = query(q.article("Invalid")).textbox("Email");
      await test.expect(field).toHaveAttribute("aria-invalid", "true");
      const weight = (await getColor(plain, "border-top-color")).alpha;

      const light = await getColor(field, "border-top-color");
      test.expect(light.lightness).toBeCloseTo(0.577, 3);
      test.expect(light.chroma).toBeCloseTo(0.245, 3);
      test.expect(light.alpha).toBe(weight);

      await page.emulateMedia({ colorScheme: "dark" });
      await test.expect(field).toHaveCSS("border-top-color", /^oklch\(0\.704 /);
      const dark = await getColor(field, "border-top-color");
      test.expect(dark.chroma).toBeCloseTo(0.191, 3);
      test.expect(dark.alpha).toBe(weight);
    });

    // The combobox select field is tuned to this height, and the wrappers and
    // the fake field must keep it next to a plain field.
    test("keeps every one-row field at the height of a text field", async ({
      q,
    }) => {
      const heightOf = async (element: Locator) => {
        const box = await element.boundingBox();
        return box?.height ?? 0;
      };
      const field = query(q.article("Default")).textbox("Full name");
      const height = await heightOf(field);
      test.expect(height).toBe(42);

      // A date input has no ARIA role that every engine exposes, so it is found
      // by its label instead of a role query.
      const date = q
        .article("Date field")
        .getByLabel("Start date", { exact: true });
      test.expect(await heightOf(date)).toBeCloseTo(height, 0);
      const wrapper = query(q.article("Field with leading icon"))
        .textbox("Filter components")
        .locator("xpath=..");
      test.expect(await heightOf(wrapper)).toBeCloseTo(height, 0);
      const trigger = query(q.article("Search trigger")).button("Search docs");
      test.expect(await heightOf(trigger)).toBeCloseTo(height, 0);

      const form = query(q.article("Inline form with submit button"));
      const email = form.textbox("Newsletter email");
      const submit = form.button("Subscribe");
      test.expect(await heightOf(submit)).toBe(await heightOf(email));
    });
  },
);
