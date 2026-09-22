import { hoverOver, inkAlpha, tabInto } from "#app/test-utils/ariakit-ui.ts";
import { withFramework } from "#app/test-utils/preview.ts";
import { getBox } from "../ariakit-ui-shell/test-helpers.ts";

withFramework(import.meta.dirname, async ({ query, test }) => {
  // The ink inherits through the slot layers, so the icon dims with the label
  // and both come back to full strength under the pointer.
  test("dims the slots with the label and restores them on hover", async ({
    q,
  }) => {
    const example = query(q.article("Dimmed button"));
    const button = example.button("Share 9");
    const label = example.text("Share");
    const icon = button.locator("svg");
    // The badge slot wraps its text in a span; the innermost one is the text.
    const badge = button.locator("span", { hasText: /^9$/ }).last();
    const labelAlpha = await inkAlpha(label);
    test.expect(labelAlpha).toBeLessThan(1);
    test.expect(await inkAlpha(icon)).toBe(labelAlpha);
    // The badge paints its own color, so it stops at its own readable floor.
    const badgeAlpha = await inkAlpha(badge);
    test.expect(badgeAlpha).toBeGreaterThan(labelAlpha);
    test.expect(badgeAlpha).toBeLessThan(1);
    await hoverOver(button);
    await test.expect.poll(() => inkAlpha(label)).toBe(1);
    await test.expect.poll(() => inkAlpha(icon)).toBe(1);

    const dim = example.button("Stay dim");
    await hoverOver(dim);
    await test.expect.poll(() => inkAlpha(dim.locator("svg"))).toBe(labelAlpha);
    test.expect(await inkAlpha(example.text("Stay dim"))).toBe(labelAlpha);
  });

  // https://github.com/ariakit/ariakit/pull/7489#discussion_r3995226174
  test("preserves the selected avatar color when its kind changes", async ({
    q,
  }) => {
    const box = query(q.article("Avatar shape"));
    const picture = box.button("Change avatar color");
    const image = picture.locator("img");
    await test.expect(image).toHaveAttribute("src", /f59e0b/);
    await picture.click();
    await test.expect(image).toHaveAttribute("src", /6366f1/);
    const round = box.button("Round avatar");
    await round.click();
    await test.expect(round).toHaveAttribute("aria-pressed", "false");
    await test.expect(image).toHaveAttribute("src", /6366f1/);
    await round.click();
    await test.expect(round).toHaveAttribute("aria-pressed", "true");
    await test.expect(image).toHaveAttribute("src", /6366f1/);
  });

  test("keeps a focusable disabled button in the tab order", async ({
    page,
    q,
  }) => {
    const focusable = query(q.article("Focusable disabled"));
    const button = focusable.button("Export");
    await test.expect(button).toHaveAttribute("aria-disabled", "true");
    await test.expect(button).not.toHaveAttribute("disabled");
    await tabInto(page, q.article("Focusable disabled"));
    await test.expect(button).toBeFocused();

    // A natively disabled button is not a stop, so Tab passes it by.
    const native = query(q.article("Disabled bevel"));
    await tabInto(page, q.article("Disabled bevel"));
    await test.expect(native.button("Archive")).not.toBeFocused();
    await test.expect(page.locator("main :focus")).toHaveCount(1);
  });

  test("checks the clicked radio of a button radio group", async ({ q }) => {
    const segmented = query(
      query(q.article("Segmented control")).radiogroup("View"),
    );
    await test.expect(segmented.radio("List")).toBeChecked();
    await segmented.radio("Grid").click();
    await test.expect(segmented.radio("Grid")).toBeChecked();
    await test.expect(segmented.radio("List")).not.toBeChecked();

    const vertical = query(
      query(q.article("Vertical bar glider")).radiogroup("Theme"),
    );
    await test.expect(vertical.radio("System")).toBeChecked();
    await vertical.radio("Dark").click();
    await test.expect(vertical.radio("Dark")).toBeChecked();
    await test.expect(vertical.radio("System")).not.toBeChecked();
  });

  // https://github.com/ariakit/ariakit/issues/7537
  test("follows only the clicked link when idle links carry an empty or false aria-current", async ({
    q,
    page,
  }) => {
    const example = q.article("Empty, false, and unknown current values");
    const links = query(example);
    const overview = links.link("Overview");
    const activity = links.link("Activity");
    const glider = example.locator(".glider");
    // Each slash sits right after the link before it, so both sit next to
    // Activity, and each also sits next to a link with an empty value.
    const firstSlash = overview.locator("xpath=following-sibling::*[1]");
    const secondSlash = activity.locator("xpath=following-sibling::*[1]");
    const transparent = "rgba(0, 0, 0, 0)";
    // Every link carries an empty or false value, so none is current: the
    // glider has nothing to land on, and every slash shows.
    await test.expect(overview).toHaveAttribute("aria-current", "");
    await test.expect(activity).toHaveAttribute("aria-current", "false");
    await test.expect(glider).toHaveCSS("display", "none");
    await test
      .expect(firstSlash)
      .not.toHaveCSS("border-right-color", transparent);
    await test
      .expect(secondSlash)
      .not.toHaveCSS("border-right-color", transparent);
    // The token on Activity counts as current. The pointer leaves the group, so
    // only the current link can still hide a slash.
    await activity.click();
    await test.expect(activity).toHaveAttribute("aria-current", "active");
    await page.mouse.move(0, 0);
    await test.expect
      .poll(async () => {
        const [box, link] = await Promise.all([
          getBox(glider),
          getBox(activity),
        ]);
        return box.x - link.x;
      })
      .toBeCloseTo(0, 0);
    // A slash eases its border color over 200ms. One that only the pointer hid
    // would still read transparent right after the pointer left.
    await page.waitForTimeout(200);
    await test.expect(firstSlash).toHaveCSS("border-right-color", transparent);
    await test.expect(secondSlash).toHaveCSS("border-right-color", transparent);
  });
});
