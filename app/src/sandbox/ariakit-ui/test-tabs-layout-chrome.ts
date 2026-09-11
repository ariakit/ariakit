import { withFramework } from "#app/test-utils/preview.ts";

withFramework(
  import.meta.dirname,
  { route: "tabs" },
  async ({ test, query }) => {
    test("a bare Tabs root is rounded and padded", async ({ q }) => {
      const strip = query(q.article("Default")).tablist("Default");
      // The root has no role, so the test reaches it through its strip.
      const root = strip.locator("xpath=..");
      await test.expect(root).toHaveCSS("border-radius", "12px");
      await test.expect(root).toHaveCSS("padding", "4px");
    });

    test("a full-width strip reaches both ends of the root", async ({ q }) => {
      const box = query(q.article("Full-width strip"));
      const strip = box.tablist("Full-width strip");
      // The strip reaches over the root's edge by the same width on both sides.
      const asymmetry = await strip.evaluate((node) => {
        const rootRect = node.parentElement?.getBoundingClientRect();
        if (!rootRect) return Number.NaN;
        const stripRect = node.getBoundingClientRect();
        const start = rootRect.left - stripRect.left;
        const end = stripRect.right - rootRect.right;
        return end - start;
      });
      test.expect(asymmetry).toBeCloseTo(0, 1);
      const widths = await box
        .tab()
        .evaluateAll((tabs) => tabs.map((tab) => tab.clientWidth));
      test.expect(new Set(widths).size).toBe(1);
    });

    test("an overflowing strip scrolls inside its box", async ({ q }) => {
      const box = query(q.article("Overflowing strip"));
      const strip = box.tablist("Overflowing strip");
      // The root is a flex item of the box row. It must stay inside the row and
      // leave the tabs that do not fit to the strip's scroll.
      const layout = await strip.evaluate((node) => {
        const root = node.parentElement;
        const row = root?.parentElement;
        if (!root || !row) return null;
        return {
          rootEnd: root.getBoundingClientRect().right,
          rowEnd: row.getBoundingClientRect().right,
          overflow: node.scrollWidth - node.clientWidth,
        };
      });
      test.expect(layout).not.toBeNull();
      if (!layout) return;
      test.expect(layout.rootEnd).toBeLessThanOrEqual(layout.rowEnd);
      test.expect(layout.overflow).toBeGreaterThan(0);
    });

    test("text entries of the tabs prop hold one line", async ({ q }) => {
      const box = query(q.article("Overflowing strip"));
      for (const name of ["Getting started", "API reference"]) {
        // Each line of the label is one client rect of its text node.
        const lines = await box.tab(name).evaluate((node) => {
          const document = node.ownerDocument;
          const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
          const text = walker.nextNode();
          if (!text) return 0;
          const range = document.createRange();
          range.selectNodeContents(text);
          return range.getClientRects().length;
        });
        test.expect(lines).toBe(1);
      }
    });

    test("a badge slot shrinks its count", async ({ q }) => {
      const tab = query(q.article("Tab with a badge")).tab(/^Code/);
      // The badge kind sizes an element child of the slot, 0.8125em of the 16px
      // tab text, so the slot must wrap its text in one.
      await test.expect(query(tab).text("3")).toHaveCSS("font-size", "13px");
    });
  },
);
