import type { Locator } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

// Whether the glider sits over the control: its center falls inside the
// control's box. A glider that is not rendered has no box and covers nothing.
async function covers(glider: Locator, control: Locator) {
  const [gliderBox, controlBox] = await Promise.all([
    glider.boundingBox(),
    control.boundingBox(),
  ]);
  if (!gliderBox) return false;
  if (!controlBox) return false;
  const x = gliderBox.x + gliderBox.width / 2;
  const y = gliderBox.y + gliderBox.height / 2;
  if (x < controlBox.x) return false;
  if (x > controlBox.x + controlBox.width) return false;
  if (y < controlBox.y) return false;
  return y <= controlBox.y + controlBox.height;
}

withFramework(
  import.meta.dirname,
  { route: "button" },
  async ({ test, query }) => {
    // Gliders are decorative and have no role, so their state classes locate
    // them. The hover glider is the one with no state class.
    const getGliders = (article: Locator) => ({
      selected: article.locator(".glider.selected"),
      hover: article.locator(".glider:not(.selected, .focus)"),
    });

    test("the segmented control's glider follows the checked radio", async ({
      q,
    }) => {
      const article = q.article("Segmented control");
      const box = query(article);
      const group = query(box.radiogroup("View"));
      const { selected } = getGliders(article);
      await test.expect(group.radio("List")).toBeChecked();
      await test.expect
        .poll(() => covers(selected, group.radio("List")))
        .toBe(true);

      await group.radio("Grid").click();
      await test.expect(group.radio("Grid")).toBeChecked();
      await test.expect(group.radio("List")).not.toBeChecked();
      await test.expect
        .poll(() => covers(selected, group.radio("Grid")))
        .toBe(true);
    });

    test("a raw glider ring paints the exact color", async ({ q }) => {
      const { selected } = getGliders(q.article("Glider ring"));
      // The selected glider's adaptive weight default must not come back after
      // $edgeRaw clears it, or the ring stays fully transparent.
      await test.expect
        .poll(() =>
          selected.evaluate((node) =>
            getComputedStyle(node).getPropertyValue("--ak-edge"),
          ),
        )
        .toMatch(/^oklch\(0\.567 0\.1546 248\.51\d*\)$/);
      await test.expect(selected).toHaveCSS("box-shadow", /1px/);
    });

    test("the bar glider marks the checked row at the end edge", async ({
      q,
    }) => {
      const article = q.article("Vertical bar glider");
      const group = query(query(article).radiogroup("Theme"));
      const { selected } = getGliders(article);
      const getEdges = async (row: Locator) => {
        const [barBox, rowBox] = await Promise.all([
          selected.boundingBox(),
          row.boundingBox(),
        ]);
        if (!barBox || !rowBox) return null;
        return {
          top: barBox.y - rowBox.y,
          bottom: barBox.y + barBox.height - (rowBox.y + rowBox.height),
          // The bar runs past the row's end, along the group's own edge.
          end: barBox.x - (rowBox.x + rowBox.width),
        };
      };

      await test.expect(group.radio("System")).toBeChecked();
      const system = await getEdges(group.radio("System"));
      test.expect(system?.top).toBeCloseTo(0, 0);
      test.expect(system?.bottom).toBeCloseTo(0, 0);
      test.expect(system?.end).toBeGreaterThanOrEqual(0);

      await group.radio("Dark").click();
      await test.expect(group.radio("Dark")).toBeChecked();
      await test.expect
        .poll(async () => (await getEdges(group.radio("Dark")))?.top)
        .toBeCloseTo(0, 0);
    });

    test("link gliders follow the current and the hovered link", async ({
      q,
    }) => {
      const article = q.article("Current link gliders");
      const box = query(article);
      const { selected, hover } = getGliders(article);
      const overview = box.link("Overview");
      const activity = box.link("Activity");
      await test.expect(overview).toHaveAttribute("aria-current", "page");
      await test.expect.poll(() => covers(selected, overview)).toBe(true);
      await test.expect(hover).toBeHidden();

      // The slash beside the current link hides, and the next one stays. The
      // separators have no role: they are the group's other plain children.
      const separators = box
        .group("Project")
        .locator(":scope > div:not(.glider)");
      const getBorderColors = () =>
        separators.evaluateAll((nodes) =>
          nodes.map((node) => getComputedStyle(node).borderInlineEndColor),
        );
      await test.expect
        .poll(async () => (await getBorderColors())[0])
        .toMatch(/\/ 0\)$|rgba\(0, 0, 0, 0\)|transparent/);
      await test.expect
        .poll(async () => (await getBorderColors())[1])
        .not.toMatch(/\/ 0\)$|rgba\(0, 0, 0, 0\)|transparent/);

      // A synthesized pointer move that scrolls the group into view does not
      // apply :hover in WebKit until the pointer enters another element, so the
      // pointer passes over Settings on its way to Activity.
      await activity.scrollIntoViewIfNeeded();
      await box.link("Settings").hover();
      await activity.hover();
      await test.expect(hover).toBeVisible();
      await test.expect.poll(() => covers(hover, activity)).toBe(true);
      await test.expect.poll(() => covers(selected, overview)).toBe(true);
    });
  },
);
