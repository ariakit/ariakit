import type { Route } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  test("loads Shiki only after the first edit", async ({ page, q }) => {
    const scripts: string[] = [];
    page.on("request", (request) => {
      if (request.resourceType() !== "script") return;
      scripts.push(request.url());
    });
    const preview = q.region("Preview");
    await test.expect(query(preview).text("Greeting")).toBeVisible();
    test.expect(scripts).toEqual([]);
    const textbox = q.textbox("Code");
    await textbox.focus();
    await textbox.press("ControlOrMeta+End");
    await textbox.pressSequentially("\nconst answer = 42;");
    await test.expect(preview).toContainText("const answer = 42;");
    // The new line has token colors from the highlighter in the browser.
    await test
      .expect(query(preview).text("answer"))
      .toHaveAttribute("style", /--shiki-dark/);
    test.expect(scripts.length).toBeGreaterThan(0);
  });

  test("keeps the last highlighted code while Shiki loads", async ({
    page,
    q,
  }) => {
    // The page is ready, so the only scripts that load now are the ones that
    // the first edit imports. The test holds them until it releases them.
    const held: Route[] = [];
    let holding = true;
    await page.route("**/*", async (route) => {
      if (!holding || route.request().resourceType() !== "script") {
        await route.continue();
        return;
      }
      held.push(route);
    });
    const preview = q.region("Preview");
    const textbox = q.textbox("Code");
    await textbox.focus();
    await textbox.press("ControlOrMeta+End");
    await textbox.pressSequentially("\nconst answer = 42;");
    await test.expect.poll(() => held.length).toBeGreaterThan(0);
    await test.expect(preview).toHaveAttribute("aria-busy", "true");
    await test.expect(preview).not.toContainText("const answer = 42;");
    await test
      .expect(query(preview).text("Greeting"))
      .toHaveAttribute("style", /--shiki-dark/);
    // The scripts that the held ones import load without a hold.
    holding = false;
    for (const route of held.splice(0)) {
      await route.continue();
    }
    await test.expect(preview).toContainText("const answer = 42;");
    await test.expect(preview).toHaveAttribute("aria-busy", "false");
  });
});
