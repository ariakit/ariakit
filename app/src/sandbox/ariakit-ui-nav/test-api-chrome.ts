import { expect } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";
import { getBox } from "../ariakit-ui-shell/test-helpers.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  test("keeps anchor props, events, and refs on a wrapped link", async ({
    q,
  }) => {
    const nav = query(q.navigation("Link wrappers"));
    const link = nav.link("Project overview");
    await expect(nav.listitem()).toHaveCount(3);
    await expect(link).toHaveAttribute("href", "#overview");
    await expect(link).toHaveAttribute("title", "Overview destination");
    await expect(link).toHaveClass(/project-link/);
    await expect(link.locator("..")).toHaveClass("project-item");
    await expect(nav.link("Project activity").locator("..")).toHaveClass(
      "custom-item",
    );
    await expect(nav.link("Project members").locator("..")).toHaveJSProperty(
      "tagName",
      "LI",
    );
    await q.button("Focus project overview").click();
    await expect(link).toBeFocused();
    await link.click();
    await expect(q.text("Last activated element: A")).toBeVisible();
    await expect(query(q.navigation("Single link")).listitem()).toHaveCount(0);
  });

  test("lets links take, omit, or replace the navigation bar", async ({
    q,
  }) => {
    const nav = query(q.navigation("Bar overrides"));
    const getBar = (name: string) => nav.link(name).locator(".control-bar");
    // Positive when the bar sits after the link's center.
    const getSide = async (name: string) => {
      const [bar, link] = await Promise.all([
        getBox(getBar(name)),
        getBox(nav.link(name)),
      ]);
      return bar.x - link.x - link.width / 2;
    };
    await expect(getBar("Default bar")).toBeVisible();
    await expect.poll(() => getSide("Default bar")).toBeLessThan(0);
    await expect(getBar("No bar")).toHaveCount(0);
    await expect(getBar("Element bar")).toBeVisible();
    await expect.poll(() => getSide("Element bar")).toBeGreaterThan(0);
    // Toggling the bar keeps the link's children mounted.
    const slot = await nav
      .link("Default bar")
      .locator(".slot-frame-slot")
      .elementHandle();
    await q.checkbox("Show bars").uncheck();
    await expect(getBar("Default bar")).toHaveCount(0);
    await q.checkbox("Show bars").check();
    await expect(getBar("Default bar")).toBeVisible();
    expect(await slot?.evaluate((node) => node.isConnected)).toBe(true);
    const recipe = query(q.navigation("Recipe bar")).link("Recipe link");
    await expect(recipe).toHaveAccessibleName("Recipe link");
    await expect(recipe.locator(".control-bar")).toBeVisible();
  });
});
