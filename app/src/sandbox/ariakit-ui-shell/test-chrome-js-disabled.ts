import { expect } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";
import { getSidebar } from "./test-helpers.ts";

// The persisted sidebar state must work before the page hydrates.
withFramework(import.meta.dirname, async ({ test }) => {
  test.use({ javaScriptEnabled: false });

  test("renders the persisted sidebar state without JavaScript", async ({
    q,
  }) => {
    const sidebar = getSidebar(q, "Documentation");
    await expect(sidebar).toHaveAttribute("data-open");
    await expect(q.navigation("Documentation")).toBeVisible();
    await expect(q.navigation("On this page")).toBeHidden();
  });
});
