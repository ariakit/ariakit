import {
  waitForPreviewHydration,
  withFramework,
} from "#app/test-utils/preview.ts";
import { galleryPages, overviewPage } from "./pages.ts";

// Every route, including the overview and the regression fixture pages. A route
// that is declared but has no `index.astro` branch renders no island, so the
// island count below catches it.
const routes = [
  { route: undefined, title: overviewPage.title, showcase: true },
  ...galleryPages.map((page) => ({
    route: page.id,
    title: page.title,
    showcase: page.kind === "showcase",
  })),
];

for (const { route, title, showcase } of routes) {
  withFramework(import.meta.dirname, { route }, async ({ test }) => {
    test("renders one hydrated island with unique example titles", async ({
      page,
      q,
    }) => {
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => {
        if (message.type() !== "error") return;
        errors.push(message.text());
      });
      // withFramework navigated before the listeners existed, and React reports
      // a hydration mismatch while the island hydrates, which is over by the
      // time the preview marker is set. Load the route again to observe it.
      await page.reload({ waitUntil: "load" });
      await waitForPreviewHydration(page);

      await test.expect(q.heading(title, { level: 1 })).toBeVisible();
      // The single-island contract: withFramework treats the first island
      // commit as a hydrated page, so a second island would race it.
      await test.expect(page.locator("astro-island")).toHaveCount(1);

      const titles = await page.locator("main article").evaluateAll((nodes) =>
        nodes.map((node) => {
          const id = node.getAttribute("aria-labelledby");
          const label = id ? node.ownerDocument.getElementById(id) : null;
          return label?.textContent?.trim() ?? "";
        }),
      );
      // Tests scope their queries with q.article(title), so a repeated or empty
      // title would make them ambiguous.
      test.expect(titles).not.toContain("");
      test.expect(new Set(titles).size).toBe(titles.length);

      // A showcase box's snippet names the knob the box is about, so two boxes
      // that print the same snippet either repeat an example or hide their
      // difference in a prop the snippet does not show. Fixture pages keep old
      // markup on purpose and are exempt.
      if (showcase) {
        const snippets = await page
          .locator("main article pre code")
          .allTextContents();
        const repeated = snippets.filter(
          (snippet, index) => snippets.indexOf(snippet) !== index,
        );
        test.expect(repeated).toEqual([]);
      }

      const hydrationErrors = errors.filter((error) =>
        /hydrat|did not match/i.test(error),
      );
      test.expect(hydrationErrors).toEqual([]);
    });
  });
}
