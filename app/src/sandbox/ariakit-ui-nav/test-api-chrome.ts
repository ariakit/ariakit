import { expect } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

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
});
