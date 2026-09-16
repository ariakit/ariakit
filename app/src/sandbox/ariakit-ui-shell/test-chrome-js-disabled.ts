import { expect } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";
import { getSidebar } from "./test-helpers.ts";

// The persisted sidebar state must work before the page hydrates.
withFramework(import.meta.dirname, async ({ test }) => {
  test.use({ javaScriptEnabled: false });

  // https://github.com/ariakit/ariakit/issues/7532
  test("renders the persisted sidebar state without JavaScript", async ({
    q,
  }) => {
    const sidebar = getSidebar(q, "Documentation");
    await expect(sidebar).not.toHaveCSS("width", "0px");
    await expect(q.navigation("Documentation")).toBeVisible();
    await expect(q.navigation("On this page")).toBeHidden();
  });
});
