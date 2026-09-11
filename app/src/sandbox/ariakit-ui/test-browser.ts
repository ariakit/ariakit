import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";
import type { ScreenshotOptions } from "#app/test-utils/visual.ts";
import { viewports } from "#app/test-utils/visual.ts";
import type {
  GallerySettingValues,
  WithFrameworkCallback,
} from "./gallery-test-utils.ts";
import {
  loadWithSettings,
  tabTo,
  withGalleryPage,
} from "./gallery-test-utils.ts";
import type { GalleryPageId } from "./pages.ts";
import {
  fixturePages,
  overviewPage,
  SCREENSHOT_FOCUS_ATTRIBUTE,
  showcasePages,
} from "./pages.ts";

// Every visual test of the gallery. The full-page captures show each page at
// rest, and the interaction captures show the states that need a pointer, the
// keyboard, a runtime change, a media emulation or another setting first. The
// snippets are hidden in every capture, so the captures show only the examples.
// Locally, visual() returns early, so these tests still run their interaction
// steps in every desktop engine.

// The settings of the interaction captures and of the fixture pages.
const lightCanvas = {
  theme: "light",
  code: "hidden",
} as const satisfies GallerySettingValues;

// The four combinations every showcase route is captured in. A setting with no
// value is the page default, which means no attribute on <html>.
const combinations = [
  ["light-canvas", lightCanvas],
  ["dark-canvas", { theme: "dark", code: "hidden" }],
  ["light-raised", { theme: "light", surface: "raised", code: "hidden" }],
  ["light-tinted", { theme: "light", surface: "tinted", code: "hidden" }],
] as const satisfies readonly (readonly [string, GallerySettingValues])[];

const focusTargetSelector = `[${SCREENSHOT_FOCUS_ATTRIBUTE}]`;

// What a Tab press can reach. A page that renders any of these must mark one of
// them, because every baseline shows exactly one real focus ring.
const tabbableSelector =
  'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])';

const launcherId = "ariakit-ui-screenshot-focus-launcher";

// WebP stores each side in 14 bits and every engine fails to encode a taller
// capture. toHaveScreenshot captures at CSS scale, so the unit is CSS pixels.
const MAX_SCREENSHOT_HEIGHT = 16_383;

// Room around an overlay that renders in a portal, so its capture takes in the
// anchor beside it: the 8px gutter and a field or a button up to 48px tall.
const OVERLAY_CLIP_MARGIN = 64;

/**
 * Moves real keyboard focus to the page's focus target. A `Tab` press, not
 * `element.focus()`, is what puts the engine in keyboard modality, which is
 * what makes `:focus-visible` match in Chrome, Firefox and Safari.
 */
async function focusScreenshotTarget(page: Page) {
  await page.evaluate(
    ({ selector, id }) => {
      const target = document.querySelector(selector);
      if (!target?.parentNode) {
        throw new Error(`No element matches ${selector}`);
      }
      const launcher = document.createElement("span");
      launcher.id = id;
      launcher.tabIndex = 0;
      // Out of flow and invisible, so inserting it cannot change the captured
      // layout. Sequential focus order follows DOM order, so the marked element
      // is still the next stop after it.
      launcher.style.cssText =
        "position:fixed;top:0;inset-inline-start:0;width:1px;height:1px;opacity:0";
      target.parentNode.insertBefore(launcher, target);
      launcher.focus();
    },
    { selector: focusTargetSelector, id: launcherId },
  );
  await page.keyboard.press("Tab");
  await page.evaluate((id) => {
    document.getElementById(id)?.remove();
  }, launcherId);
}

function countFocusTargets(page: Page) {
  return page.evaluate(
    ({ focusSelector, tabbable }) => {
      const main = document.querySelector("main");
      if (!main) return { markers: -1, tabbables: -1 };
      return {
        markers: main.querySelectorAll(focusSelector).length,
        tabbables: main.querySelectorAll(tabbable).length,
      };
    },
    { focusSelector: focusTargetSelector, tabbable: tabbableSelector },
  );
}

async function expectCapturableHeight(content: Locator) {
  const { height } = await content.evaluate((node) =>
    node.getBoundingClientRect(),
  );
  expect(height).toBeLessThanOrEqual(MAX_SCREENSHOT_HEIGHT);
}

/** The options that capture the whole content column of a page. */
function getContentCapture(content: Locator, setting: string) {
  return {
    element: content,
    fullPage: true,
    // A margin would pull in the sidebar border and the sticky header.
    clipMargin: 0,
    viewports: { desktop: viewports.desktop },
    styles: { [setting]: {} },
  } satisfies ScreenshotOptions;
}

/**
 * The options that capture one element in a setting. The setting names the
 * baseline, and the page must already show it.
 */
function getCapture(
  element: Locator,
  options: ScreenshotOptions = {},
  setting = "light-canvas",
) {
  return {
    element,
    viewports: { desktop: viewports.desktop },
    styles: { [setting]: {} },
    ...options,
  } satisfies ScreenshotOptions;
}

/**
 * The options that capture the viewport. The root element spans the whole
 * document, and a capture that is not full-page trims its clip to the viewport.
 */
function getViewportCapture(
  page: Page,
  viewport: keyof typeof viewports = "desktop",
) {
  return {
    element: page.locator("html"),
    clipMargin: 0,
    viewports: { [viewport]: viewports[viewport] },
    styles: { "light-canvas": {} },
  } satisfies ScreenshotOptions;
}

/**
 * Moves the pointer onto an element and waits until the engine matches `:hover`
 * on it, so the capture shows the hover state in every engine. Scrolling first
 * keeps the pointer move from scrolling, which WebKit would not follow with
 * `:hover`, and which resets Ariakit's hover intent.
 */
async function hoverOver(
  element: Locator,
  position?: { x: number; y: number },
) {
  await element.scrollIntoViewIfNeeded();
  await element.hover({ position });
  await expect
    .poll(() => element.evaluate((node) => node.matches(":hover")))
    .toBe(true);
}

/** Waits until an element has focus that the engine shows as keyboard focus. */
async function expectFocusVisible(element: Locator) {
  await expect(element).toBeFocused();
  await expect
    .poll(() => element.evaluate((node) => node.matches(":focus-visible")))
    .toBe(true);
}

/** Waits until the page matches a media query that the test emulates. */
async function expectMedia(page: Page, query: string) {
  await expect
    .poll(() => page.evaluate((media) => matchMedia(media).matches, query))
    .toBe(true);
}

/**
 * Runs the interaction captures of one page. Each test starts on the page in
 * the light canvas setting with the snippets hidden, at the desktop size of the
 * full-page captures.
 */
function withCapturePage(
  pageId: GalleryPageId,
  callback: WithFrameworkCallback,
) {
  withGalleryPage(pageId, async (params) => {
    params.test.use({ viewport: viewports.desktop });
    params.test.beforeEach(async ({ page }) => {
      await loadWithSettings(page, pageId, lightCanvas);
    });
    return callback(params);
  });
}

const screenshotRoutes = [
  { route: undefined, title: overviewPage.title },
  ...showcasePages.map((page) => ({ route: page.id, title: page.title })),
];

for (const { route, title } of screenshotRoutes) {
  withGalleryPage(route, async ({ test }) => {
    test.use({ viewport: viewports.desktop });
    // Each test loads the route four times and takes four full-page captures.
    // Safari needs about a second per 6000px capture locally, macOS runners are
    // slower, and generating a baseline needs two identical captures.
    test.describe.configure({ timeout: 180_000 });

    test("content @visual", async ({ page, q, visual }) => {
      const content = q.main();
      await test.expect(q.heading(title, { level: 1 })).toBeVisible();

      const { markers, tabbables } = await countFocusTargets(page);
      test.expect(markers).toBe(tabbables > 0 ? 1 : 0);

      for (const [name, values] of combinations) {
        await loadWithSettings(page, route, values);
        await expectCapturableHeight(content);
        if (markers > 0) {
          await focusScreenshotTarget(page);
          await expectFocusVisible(page.locator(focusTargetSelector));
        }
        await visual(getContentCapture(content, name));
      }
    });
  });
}

// The fixture pages hold regression scenarios whose static states their old
// style checks asserted, so one capture of each keeps them under visual
// regression. The review threads below document those checks.
//
// Button fixtures, joined borders and kept corners of button groups:
// https://github.com/ariakit/ariakit/pull/5240#discussion_r3972227948
// https://github.com/ariakit/ariakit/pull/5240#discussion_r3974550181
// Combobox fixtures, badge size and static thumbnail highlight:
// https://github.com/ariakit/ariakit/pull/5240#discussion_r3972223972
// https://github.com/ariakit/ariakit/pull/5240#discussion_r3974550839
// Layer fixtures, numeric zero hue, chroma, lightness, text and edge values:
// https://github.com/ariakit/ariakit/pull/5240#discussion_r3974019400
// https://github.com/ariakit/ariakit/pull/5240#discussion_r3974543567
// https://github.com/ariakit/ariakit/pull/5240#discussion_r3974545415
// Nav fixtures, custom navigation label styles:
// https://github.com/ariakit/ariakit/pull/5240#discussion_r3972223730
// Table fixtures, cell layers and inherited column styles:
// https://github.com/ariakit/ariakit/pull/5240#discussion_r3972228648
// https://github.com/ariakit/ariakit/pull/5240#discussion_r3974548937
// https://github.com/ariakit/ariakit/pull/5240#discussion_r3974552570
for (const { id, title } of fixturePages) {
  withCapturePage(id, async ({ test }) => {
    test("content @visual", async ({ q, visual }) => {
      const content = q.main();
      await test.expect(q.heading(title, { level: 1 })).toBeVisible();
      await expectCapturableHeight(content);
      await visual(getContentCapture(content, "light-canvas"));
    });
  });
}

withCapturePage("heading", async ({ query, test }) => {
  test("underlines a permalink on hover @visual", async ({ q, visual }) => {
    const box = q.article("Permalink");
    await hoverOver(query(box).link("Anchored heading"));
    await visual(getCapture(box));
  });
});

withCapturePage("link", async ({ query, test }) => {
  test("offsets the focus ring of a standalone link @visual", async ({
    page,
    q,
    visual,
  }) => {
    const box = q.article("Offset focus ring");
    const link = query(box).link("View all");
    await tabTo(page, link);
    await expectFocusVisible(link);
    await visual(getCapture(box));
  });

  for (const { box, name, role } of [
    { box: "Default", name: "styling guide", role: "link" },
    { box: "Wrapped across lines", name: /^A link long enough/, role: "link" },
    { box: "Rendered as a button", name: "Copy link", role: "button" },
  ] as const) {
    test(`thickens the underline on hover in ${box} @visual`, async ({
      q,
      visual,
    }) => {
      const article = q.article(box);
      const scope = query(article);
      await hoverOver(role === "link" ? scope.link(name) : scope.button(name));
      await visual(getCapture(article));
    });
  }
});

withCapturePage("button", async ({ query, test }) => {
  for (const { box, name } of [
    { box: "Thin focus ring", name: "Rename" },
    { box: "Thick focus ring", name: "Move" },
    { box: "Offset focus ring", name: "Share" },
  ]) {
    test(`shows the ${box.toLowerCase()} on keyboard focus @visual`, async ({
      page,
      q,
      visual,
    }) => {
      const article = q.article(box);
      const button = query(article).button(name);
      await tabTo(page, button);
      await expectFocusVisible(button);
      await visual(getCapture(article));
    });
  }

  test("fills a highlighted button with the brand color on keyboard focus @visual", async ({
    page,
    q,
    visual,
  }) => {
    const box = q.article("Highlighted focus");
    const button = query(box).button("Open");
    await tabTo(page, button);
    await expectFocusVisible(button);
    await visual(getCapture(box));
  });

  test("moves the segmented control glider to the clicked radio @visual", async ({
    q,
    visual,
  }) => {
    const box = q.article("Segmented control");
    const grid = query(query(box).radiogroup("View")).radio("Grid");
    await grid.click();
    await test.expect(grid).toBeChecked();
    await visual(getCapture(box));
  });

  test("moves the vertical bar glider to the clicked row @visual", async ({
    q,
    visual,
  }) => {
    const box = q.article("Vertical bar glider");
    const dark = query(query(box).radiogroup("Theme")).radio("Dark");
    await dark.click();
    await test.expect(dark).toBeChecked();
    await visual(getCapture(box));
  });

  test("moves the hover glider over a hovered link @visual", async ({
    q,
    visual,
  }) => {
    const box = q.article("Current link gliders");
    const activity = query(box).link("Activity");
    // A synthesized pointer move that scrolls the group into view does not
    // apply :hover in WebKit until the pointer enters another element, so the
    // pointer passes over Settings on its way to Activity.
    await activity.scrollIntoViewIfNeeded();
    await query(box).link("Settings").hover();
    await hoverOver(activity);
    await visual(getCapture(box));
  });
});

withCapturePage("input", async ({ query, test }) => {
  // Flips the disabled state the way application code does after render, which
  // is why the recipe draws the disabled look from CSS state instead of a prop.
  const setDisabled = (element: Locator, attribute = "disabled") =>
    element.evaluate((node, name) => {
      node.setAttribute(name, name === "disabled" ? "" : "true");
    }, attribute);

  test("draws the thick ring on a clicked field @visual", async ({
    q,
    visual,
  }) => {
    const box = q.article("Thick focus ring");
    const field = query(box).textbox("Tag");
    await field.click();
    await test.expect(field).toBeFocused();
    await visual(getCapture(box));
  });

  test("rings the wrapper when the input inside takes focus @visual", async ({
    q,
    visual,
  }) => {
    const box = q.article("Field with leading icon");
    const input = query(box).textbox("Filter components");
    await input.click();
    await test.expect(input).toBeFocused();
    await visual(getCapture(box));
  });

  test("rings the share link wrapper after a click on its prefix @visual", async ({
    q,
    visual,
  }) => {
    const box = q.article("Share link with copy button");
    await query(box).text("https://").click();
    await test.expect(query(box).textbox("Share link")).toBeFocused();
    await visual(getCapture(box));
  });

  test("rings a clicked search trigger @visual", async ({ q, visual }) => {
    const box = q.article("Search trigger");
    const trigger = query(box).button("Search docs");
    await trigger.click();
    await test.expect(trigger).toBeFocused();
    await visual(getCapture(box));
  });

  // A disabled field used to compute the same styles as an enabled one, and the
  // label around the input still takes the pointer, so its hover tint has to be
  // turned off by the same disabled state.
  test("dims the wrapper of a disabled input and keeps it unlit on hover @visual", async ({
    q,
    visual,
  }) => {
    const box = q.article("Field with leading icon");
    const input = query(box).textbox("Filter components");
    await setDisabled(input);
    await test.expect(input).toBeDisabled();
    await hoverOver(input.locator("xpath=.."), { x: 4, y: 4 });
    await visual(getCapture(box));
  });

  // The wrapper read only a natively disabled input, so an input that stays
  // focusable with aria-disabled left the wrapper enabled and hoverable.
  test("dims the wrapper of an aria-disabled input and keeps it unlit on hover @visual", async ({
    q,
    visual,
  }) => {
    const box = q.article("Field with leading icon");
    const input = query(box).textbox("Filter components");
    await setDisabled(input, "aria-disabled");
    await test.expect(input).toHaveAttribute("aria-disabled", "true");
    await hoverOver(input.locator("xpath=.."), { x: 4, y: 4 });
    await visual(getCapture(box));
  });

  // A disabled button inside a wrapper, such as a send button that waits for
  // text, must not make the editable field look or behave disabled.
  test("keeps a wrapper enabled and lit on hover when only its button is disabled @visual", async ({
    q,
    visual,
  }) => {
    const box = q.article("Share link with copy button");
    const button = query(box).button("Copy");
    await setDisabled(button);
    await test.expect(button).toBeDisabled();
    await hoverOver(query(box).text("https://"));
    await visual(getCapture(box));
  });

  // A button-type input is a button too, so a disabled submit input must leave
  // the field enabled like a disabled button element does.
  test("keeps a wrapper enabled and lit on hover when only its submit input is disabled @visual", async ({
    q,
    visual,
  }) => {
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
    await visual(getCapture(box));
  });

  // The field stays enabled while any control in it still takes entry, such as
  // a link beside a locked choice of expiry.
  test("keeps a wrapper enabled and lit on hover when only its select is disabled @visual", async ({
    q,
    visual,
  }) => {
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
    await visual(getCapture(box));
  });
});

withCapturePage("checkbox", async ({ query, test }) => {
  test("draws the ring of a focused field on its box @visual", async ({
    page,
    q,
    visual,
  }) => {
    const box = q.article("Checkbox field");
    const input = query(box).checkbox("Remember me");
    await tabTo(page, input);
    await expectFocusVisible(input);
    await visual(getCapture(box));
  });
});

withCapturePage("radio", async ({ query, test }) => {
  test("lights an enabled card on hover @visual", async ({ q, visual }) => {
    const box = q.article("Cards");
    // The card is the label around the hidden input.
    await hoverOver(
      query(box)
        .radio(/^Hobby/)
        .locator("xpath=.."),
    );
    await visual(getCapture(box));
  });

  test("keeps a card of a disabled grid unlit on hover @visual", async ({
    q,
    visual,
  }) => {
    const box = q.article("Disabled card grid");
    await hoverOver(
      query(box)
        .radio(/^Hobby/)
        .locator("xpath=.."),
    );
    await visual(getCapture(box));
  });
});

withCapturePage("combobox", async ({ test }) => {
  test("colors the badge select with the chosen status @visual", async ({
    q,
    visual,
  }) => {
    const select = q.combobox("Review status");
    await select.click();
    await q.option("Published").click();
    await test.expect(select).toHaveText("Published");
    await test.expect(q.listbox("Review status")).toBeHidden();
    await visual(getCapture(q.article("Badge select")));
  });
});

withCapturePage("tabs", async ({ query, test }) => {
  test("moves the hover glider over a hovered tab @visual", async ({
    q,
    visual,
  }) => {
    const box = q.article("Folder glider");
    // A synthesized pointer move that scrolls the strip into view does not
    // apply :hover in WebKit until the pointer enters another element, so the
    // pointer passes over Usage on its way to Preview.
    await query(box).tab("Usage").hover();
    await hoverOver(query(box).tab("Preview"));
    await visual(getCapture(box));
  });

  test("moves the focus glider to a tab without selecting it @visual", async ({
    page,
    q,
    visual,
  }) => {
    const box = q.article("Folder glider");
    const usage = query(box).tab("Usage");
    // Firefox leaves the modality of a click in place when an arrow key moves
    // focus, so the strip is reached with the keyboard.
    await tabTo(page, query(box).tab("Code"));
    await page.keyboard.press("ArrowRight");
    await expectFocusVisible(usage);
    await test.expect(usage).toHaveAttribute("aria-selected", "false");
    await visual(getCapture(box));
  });

  // The selected glider marks keyboard focus on the tab it covers with a
  // thicker top edge, which it does not have while focus is elsewhere.
  test("marks keyboard focus on the selected glider @visual", async ({
    page,
    q,
    visual,
  }) => {
    const box = q.article("Folder glider");
    const usage = query(box).tab("Usage");
    await tabTo(page, query(box).tab("Code"));
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Enter");
    await test.expect(usage).toHaveAttribute("aria-selected", "true");
    await expectFocusVisible(usage);
    await visual(getCapture(box));
  });
});

withCapturePage("nav", async ({ query, test }) => {
  // The nested section's root sits in a content that stacks over the gliders,
  // so it must not paint a surface of its own over them.
  test("shows the hover cover on a row of a nested section @visual", async ({
    q,
    visual,
  }) => {
    const box = q.article("Nested disclosures");
    await hoverOver(query(box).link("Radio"));
    await visual(getCapture(box));
  });

  test("moves the sidebar hover cover over a hovered link @visual", async ({
    q,
    visual,
  }) => {
    const box = q.article("Sidebar");
    await hoverOver(query(box).link("Quickstart").first());
    await visual(getCapture(box));
  });

  test("moves the sidebar hover cover over a hovered section button @visual", async ({
    q,
    visual,
  }) => {
    const box = q.article("Sidebar");
    await hoverOver(query(box).button("Styling"));
    await visual(getCapture(box));
  });

  // The page captures show the focus ring over the current cover, so the click
  // moves the cover away first. The second Introduction is the page's
  // screenshot focus target, which carries a tab index, so WebKit keeps it in
  // sequential focus navigation too.
  test("moves the sidebar current cover on click and the focus ring with the keyboard @visual", async ({
    page,
    q,
    visual,
  }) => {
    const box = q.article("Sidebar");
    const quickstart = query(box).link("Quickstart").first();
    await quickstart.click();
    await test.expect(quickstart).toHaveAttribute("aria-current", "page");
    const introduction = query(box).link("Introduction").nth(1);
    await tabTo(page, introduction);
    await expectFocusVisible(introduction);
    await visual(getCapture(box));
  });
});

withCapturePage("table", async ({ query, test }) => {
  test("draws a focused cell's ring inside the cell @visual", async ({
    page,
    q,
    visual,
  }) => {
    const box = q.article("Selected rows");
    const grid = query(box);
    await grid.checkbox("Select all rows").focus();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowRight");
    await expectFocusVisible(grid.rowheader("Glider"));
    await visual(getCapture(box));
  });

  // The ring lies over the cells and stops at the line below the row, which its
  // cells draw.
  test("draws a focused row's ring around its cells @visual", async ({
    page,
    q,
    visual,
  }) => {
    const box = q.article("Focusable rows");
    const first = query(box).row(/^Button /);
    await first.focus();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowUp");
    await expectFocusVisible(first);
    await visual(getCapture(box));
  });

  // The last row draws no line below it, and its ring follows the container's
  // rounded bottom corners inside its 1px border.
  test("rounds the ring of the focused last row @visual", async ({
    page,
    q,
    visual,
  }) => {
    const box = q.article("Focusable rows");
    await query(box)
      .row(/^Button /)
      .focus();
    await page.keyboard.press("End");
    await expectFocusVisible(query(box).row(/^Table /));
    await visual(getCapture(box));
  });
});

withCapturePage("progress", async ({ test }) => {
  // Forced colors repaint every background in the system canvas and drop
  // box-shadows and gradients, which used to leave nothing of a bar or a ring.
  test("keeps bars and rings visible in forced colors @visual", async ({
    page,
    q,
    visual,
  }) => {
    await page.emulateMedia({ forcedColors: "active" });
    await expectMedia(page, "(forced-colors: active)");
    await visual(getCapture(q.article("Default"), { id: "bar" }));
    await visual(getCapture(q.article("Ring with label"), { id: "ring" }));
  });

  // The track's inset ring used to read the border width of the bordered
  // Example box around it, so $border={false} still drew the edge where the
  // edge shows: in high contrast.
  test("draws the track edge only on a bordered track in high contrast @visual", async ({
    page,
    q,
    visual,
  }) => {
    await page.emulateMedia({ contrast: "more" });
    await expectMedia(page, "(prefers-contrast: more)");
    await visual(getCapture(q.article("Default"), { id: "bordered" }));
    await visual(
      getCapture(q.article("Borderless track"), { id: "borderless" }),
    );
  });
});

withCapturePage("popover", async ({ test }) => {
  test("floats the live popover away from its disclosure @visual", async ({
    q,
    visual,
  }) => {
    await q.button("Event details").click();
    const popover = q.dialog("Design review");
    await test.expect(popover).toBeVisible();
    await visual(getCapture(popover, { clipMargin: OVERLAY_CLIP_MARGIN }));
  });

  // The popover is out of flow, so only its stage keeps it inside the box at
  // every text size.
  for (const fontSize of ["sm", "lg"]) {
    test(`content at the ${fontSize} text size @visual`, async ({
      page,
      q,
      visual,
    }) => {
      await loadWithSettings(page, "popover", {
        ...lightCanvas,
        "font-size": fontSize,
      });
      await expectCapturableHeight(q.main());
      await visual(getContentCapture(q.main(), "light-canvas"));
    });
  }
});

withCapturePage("dialog", async ({ query, test }) => {
  const dialogs = [
    { box: "Default", disclosure: "View receipt", name: "Success" },
    { box: "Close button", disclosure: "Invite member", name: "Invite sent" },
    { box: "Form", disclosure: "Rename project", name: "Rename project" },
    {
      box: "Scroll body with header and footer",
      disclosure: "Release notes",
      name: "Release notes",
    },
    {
      box: "Long content",
      disclosure: "Terms of service",
      name: "Terms of service",
    },
    { box: "Custom max width", disclosure: "Sign out", name: "Sign out?" },
    { box: "Brand surface", disclosure: "Upgrade", name: "Upgrade to Pro" },
    {
      box: "Nested dialogs",
      disclosure: "Project settings",
      name: "Project settings",
    },
  ];

  // A dialog covers the viewport with its backdrop, which washes the page
  // behind it, so these capture the viewport.
  for (const { box, disclosure, name } of dialogs) {
    test(`opens the ${name} dialog @visual`, async ({ page, q, visual }) => {
      await query(q.article(box)).button(disclosure).click();
      await test.expect(q.dialog(name)).toBeVisible();
      await visual(getViewportCapture(page));
    });
  }

  test("opens a nested dialog over the dialog that opened it @visual", async ({
    page,
    q,
    visual,
  }) => {
    await q.button("Project settings").click();
    await query(q.dialog("Project settings")).button("Delete project").click();
    await test.expect(q.dialog("Delete project?")).toBeVisible();
    await visual(getViewportCapture(page));
  });
});

withCapturePage("tooltip", async ({ test }) => {
  // The live tooltip portals into the gallery surface, so it lifts from the
  // same layer as the held ones instead of from the canvas.
  test("lifts the live tooltip from a tinted surface @visual", async ({
    page,
    q,
    visual,
  }) => {
    await loadWithSettings(page, "tooltip", {
      ...lightCanvas,
      surface: "tinted",
    });
    await hoverOver(q.button("Publish"));
    const tooltip = q.tooltip("Publish to the public site");
    await test.expect(tooltip).toBeVisible();
    await visual(
      getCapture(tooltip, { clipMargin: OVERLAY_CLIP_MARGIN }, "light-tinted"),
    );
  });

  // The tooltip is out of flow, so only its stage keeps it inside the box at
  // every text size.
  for (const fontSize of ["sm", "lg"]) {
    test(`content at the ${fontSize} text size @visual`, async ({
      page,
      q,
      visual,
    }) => {
      await loadWithSettings(page, "tooltip", {
        ...lightCanvas,
        "font-size": fontSize,
      });
      await expectCapturableHeight(q.main());
      await visual(getContentCapture(q.main(), "light-canvas"));
    });
  }
});

withCapturePage("combobox-fixtures", async ({ test }) => {
  // The old sandbox rendered this section at the top of a bare page. Here the
  // gallery header comes first, so scroll the section to the top of the
  // viewport: the popovers then have room to open below their anchors instead
  // of flipping above them.
  const scrollToTop = (section: Locator) =>
    section.evaluate((node) => {
      node.scrollIntoView({ block: "start" });
    });

  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3972224343
  test("keeps the combobox list spacing with optional position props @visual", async ({
    q,
    visual,
  }) => {
    await scrollToTop(q.region("Project editor"));
    await q.combobox("Assignee").click();
    const list = q.listbox("Assignee");
    await test.expect(list).toBeVisible();
    await visual(getCapture(list, { clipMargin: OVERLAY_CLIP_MARGIN }));
  });

  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3972224343
  test("keeps the select list spacing with optional position props @visual", async ({
    q,
    visual,
  }) => {
    await scrollToTop(q.region("Project editor"));
    await q.combobox("Status").click();
    const list = q.listbox("Status");
    await test.expect(list).toBeVisible();
    await visual(getCapture(list, { clipMargin: OVERLAY_CLIP_MARGIN }));
  });
});

withCapturePage("progress-fixtures", async ({ query, test }) => {
  // The fill animates toward each value, and the capture disables animations,
  // so each one shows where the bar and the ring settle.
  test("moves the bar and the ring to each new value @visual", async ({
    q,
    visual,
  }) => {
    const box = q.article("Value change");
    const scope = query(box);
    const bar = scope.progressbar("Build bar");

    await scope.button("Advance").click();
    await test.expect(bar).toHaveAttribute("aria-valuenow", "0.5");
    await visual(getCapture(box, { id: "half" }));

    await scope.button("Advance").click();
    await scope.button("Advance").click();
    await test.expect(bar).toHaveAttribute("aria-valuenow", "1");
    await visual(getCapture(box, { id: "full" }));

    await scope.button("Reset").click();
    await test.expect(bar).toHaveAttribute("aria-valuenow", "0");
    await visual(getCapture(box, { id: "empty" }));
  });
});

withCapturePage("table-fixtures", async ({ query, test }) => {
  // The narrow containers of the fixture tables let the cells scroll under the
  // pinned ones. A pinned cell must paint the row's surface, which the row
  // shows through the ordinary cells, at rest and in every row state.
  const scrollCellsUnderPinnedCell = async (table: Locator) => {
    const scroller = table.locator("xpath=..");
    const scrollLeft = await scroller.evaluate((node) => {
      node.scrollLeft = node.scrollWidth;
      return node.scrollLeft;
    });
    test.expect(scrollLeft).toBeGreaterThan(0);
  };

  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3972228648
  test("paints the pinned cell over the cells scrolled under it @visual", async ({
    q,
    visual,
  }) => {
    const box = q.article("Table cell layer");
    await scrollCellsUnderPinnedCell(query(box).grid());
    await visual(getCapture(box));
  });

  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3972228648
  test("shows the hovered row through ordinary cells @visual", async ({
    q,
    visual,
  }) => {
    const box = q.article("Table cell layer");
    await scrollCellsUnderPinnedCell(query(box).grid());
    await hoverOver(query(box).text("Disabled surface"));
    await visual(getCapture(box));
  });

  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3972228648
  test("shows the selected row through ordinary cells @visual", async ({
    q,
    visual,
  }) => {
    const box = q.article("Table cell layer");
    await scrollCellsUnderPinnedCell(query(box).grid());
    await query(box).checkbox("Select row").check();
    await test
      .expect(query(box).row())
      .toHaveAttribute("aria-selected", "true");
    await visual(getCapture(box));
  });

  // The head cell sets the pinned column, and the body and foot cells inherit
  // it, so the names stay over the scrolled columns in every row group.
  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3974552570
  test("keeps the names pinned over the scrolled columns @visual", async ({
    q,
    visual,
  }) => {
    const box = q.article("Table rows");
    await scrollCellsUnderPinnedCell(query(box).table("Team hours"));
    await visual(getCapture(box));
  });

  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3974552570
  test("scrolls the names with the columns when they are unpinned @visual", async ({
    q,
    visual,
  }) => {
    const box = q.article("Table rows");
    const pin = query(box).checkbox("Pin contributor names");
    await pin.uncheck();
    await test.expect(pin).not.toBeChecked();
    await scrollCellsUnderPinnedCell(query(box).table("Team hours"));
    await visual(getCapture(box));
  });

  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3974552570
  test("keeps missing hours under their header after adding a contributor @visual", async ({
    q,
    visual,
  }) => {
    const box = q.article("Table rows");
    await query(box).button("Add contributor").click();
    await test.expect(query(box).row(/^Katherine\b/)).toBeVisible();
    await visual(getCapture(box));
  });
});

// The shell is the same on every page, so one page shows it. The full-page
// captures take only the content column, so these capture the shell around it.
withCapturePage("nav", async ({ test }) => {
  test("shows the gallery sidebar beside the page @visual", async ({
    q,
    visual,
  }) => {
    const sidebar = q.complementary("Gallery sections");
    await test.expect(sidebar).toBeVisible();
    // A margin would pull in the header and the page beside the sidebar.
    await visual(getCapture(sidebar, { clipMargin: 0 }));
  });

  test.describe("mobile", () => {
    test.use({ viewport: viewports.mobile });

    test("shows the gallery navigation toggle in the corner @visual", async ({
      page,
      q,
      visual,
    }) => {
      await test.expect(q.button("Open gallery sections")).toBeVisible();
      await visual(getViewportCapture(page, "mobile"));
    });

    test("opens the gallery navigation dialog @visual", async ({
      page,
      q,
      visual,
    }) => {
      await q.button("Open gallery sections").click();
      await test.expect(q.dialog("Gallery sections")).toBeVisible();
      await visual(getViewportCapture(page, "mobile"));
    });
  });
});
