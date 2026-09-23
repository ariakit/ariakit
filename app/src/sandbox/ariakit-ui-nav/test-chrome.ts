import type { Locator } from "@playwright/test";
import {
  expectMedia,
  hoverOver,
  inkAlpha,
} from "#app/test-utils/ariakit-ui.ts";
import { withFramework } from "#app/test-utils/preview.ts";
import { getBox } from "../ariakit-ui-shell/test-helpers.ts";

withFramework(import.meta.dirname, async ({ query, test }) => {
  // On a dark layer an idle row dims its label, and the ink inherits through
  // the icon slot layer, so the icon dims with it. A hovered or current row
  // brings both back to full strength.
  test("dims a row's icon with its label on a dark layer", async ({
    page,
    q,
  }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await expectMedia(page, "(prefers-color-scheme: dark)");
    const nav = query(q.navigation("Icons"));
    const idle = nav.link("Getting started");
    const idleAlpha = await inkAlpha(idle);
    test.expect(idleAlpha).toBeLessThan(1);
    test.expect(await inkAlpha(idle.locator("svg"))).toBe(idleAlpha);

    const current = nav.link(/^Accessibility/);
    test.expect(await inkAlpha(current)).toBe(1);
    test.expect(await inkAlpha(current.locator("svg"))).toBe(1);

    await hoverOver(idle);
    await test.expect.poll(() => inkAlpha(idle)).toBe(1);
    await test.expect.poll(() => inkAlpha(idle.locator("svg"))).toBe(1);
  });

  // https://github.com/ariakit/ariakit/pull/7494#discussion_r3998773048
  test("keeps a bare fragment label separate from its description and badge", async ({
    q,
  }) => {
    const button = query(q.article("Disclosure badges")).button(
      "Account pages",
    );
    await test
      .expect(button)
      .toHaveAccessibleDescription("Manage account pages");
    await test
      .expect(button.locator(":scope > .disclosure-button-slot"))
      .toHaveText("3");
    await button.click();
    await test.expect(q.text("Update account pages")).toBeVisible();
  });

  // https://github.com/ariakit/ariakit/pull/7494#discussion_r3995263562
  test("keeps a disclosure badge beside the label without a description", async ({
    q,
  }) => {
    const example = query(q.article("Disclosure badges"));
    const button = example.button("Project pages 3");
    await test
      .expect(button.locator(":scope > span").filter({ hasText: /^3$/ }))
      .toHaveCount(1);
    await button.click();
    await test.expect(example.link("Manage project pages")).toBeHidden();
  });

  // https://github.com/ariakit/ariakit/pull/7494#discussion_r3998666934
  test("keeps a disclosure badge beside a consumer label component with a description", async ({
    q,
  }) => {
    const example = query(q.article("Disclosure badges"));
    const button = example.button("Team pages");
    await test
      .expect(button)
      .toHaveAttribute("aria-labelledby", "nav-pages-label");
    await test
      .expect(button)
      .toHaveAccessibleDescription("All pages in this workspace");
    await test
      .expect(button.locator(":scope > span").filter({ hasText: /^3$/ }))
      .toHaveCount(1);
    await button.click();
    await test.expect(example.link("Manage team pages")).toBeHidden();
  });

  // https://github.com/ariakit/ariakit/issues/7579
  test("scales the text of a badge in the icon column like the other nav badges", async ({
    q,
  }) => {
    const nav = query(q.navigation("Badges and avatars"));
    const fontSize = (locator: Locator) =>
      locator.evaluate((node) => getComputedStyle(node).fontSize);
    const rowSize = await fontSize(nav.link(/Notifications/));
    const badgeSize = await fontSize(nav.text("3"));
    test
      .expect(Number.parseFloat(badgeSize))
      .toBeLessThan(Number.parseFloat(rowSize));
    await test.expect(nav.text("12")).toHaveCSS("font-size", badgeSize);
    await test.expect(nav.text("9")).toHaveCSS("font-size", badgeSize);
  });

  test("names a link by its label and describes it by its description", async ({
    q,
  }) => {
    const nav = query(q.navigation("Link descriptions"));
    const link = nav.link("Workspace settings and preferences");
    await test.expect(link).toHaveAttribute("href", "#settings");
    await test.expect(link).toHaveAccessibleDescription("Members and billing");
  });

  test("marks only the link that matches the current URL", async ({ q }) => {
    const rows = query(q.navigation("Rows"));
    await test
      .expect(rows.link("Installation"))
      .toHaveAttribute("aria-current", "page");
    await test
      .expect(rows.link("Overview"))
      .not.toHaveAttribute("aria-current");
    await test.expect(rows.link("Usage")).not.toHaveAttribute("aria-current");
    // A link to a part of the current page is not the current page.
    await test.expect(rows.link("Options")).not.toHaveAttribute("aria-current");

    // A placeholder link has no destination, so it stays out of the tab order.
    const roadmap = rows.link("Roadmap");
    await test.expect(roadmap).toHaveAttribute("aria-disabled", "true");
    await test.expect(roadmap).not.toHaveAttribute("href");
    await rows.link("Usage").focus();
    await rows.link("Usage").press("Tab");
    await test.expect(roadmap).not.toBeFocused();
  });

  test("opens the section that holds the current link", async ({ q }) => {
    const nav = query(q.navigation("Disclosures"));
    await test
      .expect(nav.button("Getting started"))
      .toHaveAttribute("aria-expanded", "true");
    await test
      .expect(nav.button("Styling"))
      .toHaveAttribute("aria-expanded", "true");
    await test
      .expect(nav.button("Composition"))
      .toHaveAttribute("aria-expanded", "false");
    const current = q
      .navigation("Disclosures")
      .locator("[aria-current='page']");
    await test.expect(current).toHaveAccessibleName("Introduction");
    await test.expect(current).toBeVisible();
    await test
      .expect(current)
      .toHaveAttribute("href", "/docs/styling/introduction");
  });

  test("opens every section around a deep current link", async ({ q }) => {
    const nav = query(q.navigation("Nested disclosures"));
    await test
      .expect(nav.button("Components"))
      .toHaveAttribute("aria-expanded", "true");
    await test
      .expect(nav.button("Forms"))
      .toHaveAttribute("aria-expanded", "true");
    const checkbox = nav.link("Checkbox");
    await test.expect(checkbox).toHaveAttribute("aria-current", "page");
    await test.expect(checkbox).toBeVisible();
  });

  test("moves the current page when a sidebar link is clicked", async ({
    q,
  }) => {
    const nav = query(q.navigation("Documentation sections"));
    const current = q
      .navigation("Documentation sections")
      .locator("[aria-current='page']");
    await test.expect(current).toHaveCount(1);
    await test
      .expect(current)
      .toHaveAttribute("href", "/docs/styling/introduction");
    await nav.link("Quickstart").first().click();
    await test.expect(current).toHaveCount(1);
    await test
      .expect(current)
      .toHaveAttribute("href", "/docs/start/quickstart");
  });

  // Regression fixtures.
  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3974552687
  test("omits a conditional navigation button without hiding its links", async ({
    q,
  }) => {
    const fixture = query(q.article("Optional navigation headings"));
    const navigation = query(fixture.navigation("Workspace navigation"));
    await test.expect(navigation.link("Workspace members")).toBeVisible();
    await test.expect(navigation.link("Workspace settings")).toBeVisible();
    await test.expect(navigation.button()).toHaveCount(0);

    await fixture.checkbox("Show navigation headings").check();
    const button = navigation.button("Workspace pages");
    await test.expect(button).toBeVisible();
    await test.expect(navigation.button()).toHaveCount(1);
    await test.expect(button).toHaveAttribute("aria-expanded", "false");
    await test.expect(navigation.link("Workspace members")).toBeHidden();
    await button.click();
    await test.expect(navigation.link("Workspace members")).toBeVisible();
    await test.expect(navigation.link("Workspace settings")).toBeVisible();
    await button.click();
    await test.expect(navigation.link("Workspace members")).toBeHidden();

    await fixture.checkbox("Show navigation headings").uncheck();
    await test.expect(navigation.link("Workspace members")).toBeVisible();
    await test.expect(navigation.link("Workspace settings")).toBeVisible();
    await test.expect(navigation.button()).toHaveCount(0);
  });

  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3974552687
  test("keeps zero as a navigation button label", async ({ q }) => {
    const navigation = query(q.navigation("Invitation navigation"));
    const button = navigation.button("0");
    await test.expect(button).toBeVisible();
    await test.expect(button).toHaveAttribute("aria-expanded", "false");
    await test.expect(navigation.link("Invitation settings")).toBeHidden();
    await button.click();
    await test.expect(button).toHaveAttribute("aria-expanded", "true");
    await test.expect(navigation.link("Invitation settings")).toBeVisible();
  });

  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3973584695
  test("uses the explicit navigation button and content without extra controls", async ({
    q,
  }) => {
    const navigation = query(q.navigation("Project navigation"));
    const button = navigation.button("Project pages");
    await test.expect(button).toBeVisible();
    await test.expect(navigation.button()).toHaveCount(1);
    await test.expect(button).toHaveAttribute("aria-expanded", "false");
    await test.expect(navigation.link("All projects")).toBeHidden();

    await button.click();
    await test.expect(button).toHaveAttribute("aria-expanded", "true");
    await test.expect(navigation.link("All projects")).toBeVisible();
    await test.expect(navigation.button()).toHaveCount(1);

    await button.click();
    await test.expect(navigation.link("All projects")).toBeHidden();
    await test.expect(button).toBeVisible();
  });

  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3972223511
  test("keeps a dialog closed when its navigation contains the current page", async ({
    q,
  }) => {
    const fixture = query(q.article("Current page in a dialog"));
    const disclosure = fixture.button("Open navigation dialog");
    await test.expect(disclosure).toHaveAttribute("aria-expanded", "false");
    // The dialog renders in a portal, outside the fixture.
    await test.expect(q.dialog("Navigation dialog")).toBeHidden();

    await disclosure.click();
    const dialog = q.dialog("Navigation dialog");
    await test.expect(dialog).toBeVisible();
    await test
      .expect(query(dialog).link("Documentation"))
      .toHaveAttribute("aria-current", "page");

    await query(dialog).button("Close navigation dialog").click();
    await test.expect(q.dialog("Navigation dialog")).toBeHidden();
  });

  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3972223511
  test("opens the current page's navigation group across an unrelated provider", async ({
    q,
  }) => {
    const fixture = query(q.article("Section across an unrelated provider"));
    await test
      .expect(fixture.button("Account pages"))
      .toHaveAttribute("aria-expanded", "true");
    await test.expect(fixture.link("Account overview")).toBeVisible();
    await test
      .expect(fixture.button("Open account settings"))
      .toHaveAttribute("aria-expanded", "false");
    // The dialog renders in a portal, outside the fixture.
    await test.expect(q.dialog("Account settings")).toBeHidden();

    await fixture.button("Open account settings").click();
    await test.expect(q.dialog("Account settings")).toBeVisible();
  });

  // https://github.com/ariakit/ariakit/issues/7537
  test("follows only the current link when idle links carry an empty or false aria-current", async ({
    q,
  }) => {
    const nav = q.navigation("Empty, false, and unknown current values");
    const rows = query(nav);
    const bar = nav.locator(":scope > .glider");
    const overview = rows.link("Overview");
    const themes = rows.link("Themes");
    const tokens = rows.link("Tokens");
    const changelog = rows.link("Changelog");
    const styling = rows.button("Styling");
    const barEdges = async () => {
      const box = await getBox(bar);
      return {
        top: box.y,
        end: box.x + box.width,
        center: box.x + box.width / 2,
      };
    };
    await nav.scrollIntoViewIfNeeded();
    // Idle links drop to the normal weight; the current link keeps the heavier
    // weight of a button.
    await test.expect(overview).toHaveAttribute("aria-current", "active");
    await test.expect(themes).toHaveAttribute("aria-current", "");
    await test.expect(tokens).toHaveAttribute("aria-current", "false");
    await test.expect(changelog).toHaveAttribute("aria-current", "false");
    await test.expect(overview).not.toHaveCSS("font-weight", "400");
    for (const link of [themes, tokens, changelog]) {
      await test.expect(link).toHaveCSS("font-weight", "400");
    }
    // No row of the section is current, so its guide line stays unnamed, and
    // Changelog is not current either, so the bar sits on the start edge of
    // Overview.
    const overviewBox = await getBox(overview);
    await test.expect
      .poll(async () => (await barEdges()).top)
      .toBeCloseTo(overviewBox.y, 0);
    await test.expect
      .poll(async () => (await barEdges()).end)
      .toBeCloseTo(overviewBox.x, 0);
    // The token on Themes counts as current, so the bar moves onto the guide
    // line, which runs down the center of the section's icon.
    await themes.click();
    await test.expect(themes).toHaveAttribute("aria-current", "active");
    await test.expect(themes).not.toHaveCSS("font-weight", "400");
    for (const link of [overview, tokens, changelog]) {
      await test.expect(link).toHaveCSS("font-weight", "400");
    }
    const [themesBox, iconBox] = await Promise.all([
      getBox(themes),
      getBox(styling.locator(".control-slot").first()),
    ]);
    await test.expect
      .poll(async () => (await barEdges()).top)
      .toBeCloseTo(themesBox.y, 0);
    await test.expect
      .poll(async () => (await barEdges()).center)
      .toBeCloseTo(iconBox.x + iconBox.width / 2, 0);
    // A current row in a closed section counts as none, and neither the empty
    // value on Overview nor the false one on Changelog counts, so the bar
    // leaves.
    await styling.click();
    await test.expect(styling).toHaveAttribute("aria-expanded", "false");
    await test.expect(bar).toHaveCSS("display", "none");
  });
});
