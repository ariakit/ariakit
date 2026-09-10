import { query } from "@ariakit/test/playwright";
import { test } from "#app/test-utils/fixtures.ts";

test("keeps the gallery sidebar expanded on desktop", async ({ page, q }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/ariakit-ui/nav/");
  await test.expect(page.locator("astro-island[ssr]")).toHaveCount(0);

  const sidebar = q.complementary("Gallery sections");
  await test.expect(sidebar).toBeVisible();
  await test
    .expect(query(sidebar).link("Nav", { exact: true }))
    .toHaveAttribute("aria-current", "page");
  await test.expect(q.button("Open gallery sections")).toBeHidden();
  await test.expect(q.button("Collapse sidebar")).toHaveCount(0);
  await test.expect(sidebar).toHaveCSS("width", "256px");

  await query(sidebar).link("Button", { exact: true }).click();
  await test.expect(page).toHaveURL(/\/ariakit-ui\/button\/$/);
  await test
    .expect(
      query(q.complementary("Gallery sections")).link("Button", {
        exact: true,
      }),
    )
    .toHaveAttribute("aria-current", "page");
});

test("opens and dismisses the gallery navigation dialog on mobile", async ({
  page,
  q,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/ariakit-ui/nav/");
  await test.expect(page.locator("astro-island[ssr]")).toHaveCount(0);

  const toggle = q.button("Open gallery sections");
  await test.expect(q.complementary("Gallery sections")).toBeHidden();
  await test.expect(toggle).toHaveCSS("position", "fixed");
  await test.expect(toggle).toBeInViewport({ ratio: 1 });
  await test.expect(toggle).toHaveCSS("bottom", "16px");
  await test.expect(toggle).toHaveCSS("inset-inline-end", "16px");
  await toggle.click();
  const dialog = q.dialog("Gallery sections");
  await test.expect(dialog).toBeVisible();
  await test
    .expect(query(dialog).link("Nav", { exact: true }))
    .toHaveAttribute("aria-current", "page");

  await q.button("Close gallery sections").click();
  await test.expect(dialog).toBeHidden();
  await test.expect(toggle).toBeFocused();
  await toggle.click();
  await page.keyboard.press("Escape");
  await test.expect(dialog).toBeHidden();
  await test.expect(toggle).toBeFocused();

  await toggle.click();
  await query(dialog).link("Button", { exact: true }).click();
  await test.expect(page).toHaveURL(/\/ariakit-ui\/button\/$/);
  await test.expect(page.locator("astro-island[ssr]")).toHaveCount(0);
  await test.expect(q.dialog("Gallery sections")).toBeHidden();
  await q.button("Open gallery sections").click();
  await test
    .expect(query(q.dialog("Gallery sections")).link("Button", { exact: true }))
    .toHaveAttribute("aria-current", "page");
});

test("dismisses the mobile dialog when the gallery switches to desktop", async ({
  page,
  q,
}) => {
  await page.setViewportSize({ width: 767, height: 844 });
  await page.goto("/ariakit-ui/nav/");
  await test.expect(page.locator("astro-island[ssr]")).toHaveCount(0);
  await test.expect(q.complementary("Gallery sections")).toBeHidden();
  await q.button("Open gallery sections").click();
  await test.expect(q.dialog("Gallery sections")).toBeVisible();

  await page.setViewportSize({ width: 768, height: 844 });
  await test.expect(q.dialog("Gallery sections")).toBeHidden();
  const sidebar = q.complementary("Gallery sections");
  await test.expect(sidebar).toBeVisible();
  await test.expect(q.button("Open gallery sections")).toBeHidden();
  await query(sidebar).link("Button", { exact: true }).click();
  await test.expect(page).toHaveURL(/\/ariakit-ui\/button\/$/);
});
