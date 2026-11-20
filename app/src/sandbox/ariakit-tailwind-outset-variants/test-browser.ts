import { withFramework } from "#app/test-utils/preview.ts";

const LIGHT = "3px";
const DARK = "2px";
const LIGHT_HIGH = "16px";
const LIGHT_LOW = "12px";
const DARK_LOW = "8px";
const DARK_HIGH = "4px";
const NOT_DARK = "underline";
const DARK_LINE = "none";

// The ak-outset-* variants set the bottom border, the padding, and the
// underline. The regular variants set the top border.
withFramework(import.meta.dirname, async ({ test, query }) => {
  test("ak-outset variants read the outer layer where ak-outset applies", async ({
    q,
  }) => {
    const darkTab = query(q.region("Outset bar under a dark tab"));
    const darkTabBar = darkTab.text("Bar");
    await test.expect(darkTabBar).toHaveCSS("border-bottom-width", LIGHT);
    await test.expect(darkTabBar).toHaveCSS("padding-inline-start", LIGHT_HIGH);
    await test.expect(darkTabBar).toHaveCSS("text-decoration-line", NOT_DARK);

    const lightTab = query(q.region("Outset bar under a light tab"));
    const lightTabBar = lightTab.text("Bar");
    await test.expect(lightTabBar).toHaveCSS("border-bottom-width", DARK);
    await test.expect(lightTabBar).toHaveCSS("padding-inline-start", DARK_HIGH);
    await test.expect(lightTabBar).toHaveCSS("text-decoration-line", DARK_LINE);
  });

  test("regular variants read the parent layer on an ak-outset element", async ({
    q,
  }) => {
    const darkTab = query(q.region("Outset bar under a dark tab"));
    await test.expect(darkTab.text("Bar")).toHaveCSS("border-top-width", DARK);
    await test
      .expect(darkTab.text("Tab label"))
      .toHaveCSS("border-top-width", DARK);

    const lightTab = query(q.region("Outset bar under a light tab"));
    await test
      .expect(lightTab.text("Bar"))
      .toHaveCSS("border-top-width", LIGHT);
    await test
      .expect(lightTab.text("Tab label"))
      .toHaveCSS("border-top-width", LIGHT);
  });

  test("ak-outset variants split like the regular variants on the outer layer", async ({
    q,
  }) => {
    const cyan = query(q.region("Outset bar on a vivid cyan surface"));
    const surfaceText = cyan.text("Surface text");
    await test.expect(surfaceText).toHaveCSS("border-top-width", LIGHT);
    await test.expect(surfaceText).toHaveCSS("padding-inline-end", DARK_LOW);
    await test.expect(cyan.text("Bar")).toHaveCSS("border-bottom-width", LIGHT);
    await test
      .expect(cyan.text("Bar"))
      .toHaveCSS("padding-inline-start", DARK_LOW);
  });

  test("ak-outset variants match the low bands of the outer layer", async ({
    q,
  }) => {
    const darkLow = query(q.region("Outset bar on a dark low surface"));
    await test
      .expect(darkLow.text("Bar"))
      .toHaveCSS("padding-inline-start", DARK_LOW);

    const lightLow = query(q.region("Outset bar on a light low surface"));
    await test
      .expect(lightLow.text("Bar"))
      .toHaveCSS("padding-inline-start", LIGHT_LOW);
  });

  test("ak-outset variants read the nearest layer where the parent isn't a layer", async ({
    q,
  }) => {
    const darkTab = query(q.region("Outset bar under a dark tab"));
    const nested = darkTab.text("Nested text");
    await test.expect(nested).toHaveCSS("border-bottom-width", DARK);
    await test.expect(nested).toHaveCSS("padding-inline-start", DARK_HIGH);
    await test.expect(nested).toHaveCSS("text-decoration-line", DARK_LINE);

    const lightTab = query(q.region("Outset bar under a light tab"));
    await test
      .expect(lightTab.text("Nested text"))
      .toHaveCSS("border-bottom-width", LIGHT);
  });

  test("ak-outset variants read the outer layer where a conditional ak-outset doesn't apply", async ({
    q,
  }) => {
    const over = query(q.region("Bar over a dark tab"));
    const bar = over.text("Bar");
    await test.expect(bar).toHaveCSS("padding-inline-start", LIGHT_HIGH);
    await test.expect(bar).toHaveCSS("text-decoration-line", NOT_DARK);
    // The regular variants that the bar adds for this case read the tab.
    await test.expect(bar).toHaveCSS("border-bottom-width", DARK);
  });
});
