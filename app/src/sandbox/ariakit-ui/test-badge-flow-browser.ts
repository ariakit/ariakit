import type { Locator } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

// The vertical span of each line box that the element's own text takes, not
// counting the text of its child elements.
function getTextLines(element: Locator) {
  return element.evaluate((node) => {
    const lines: { top: number; bottom: number }[] = [];
    for (const child of node.childNodes) {
      if (child.nodeType !== child.TEXT_NODE) continue;
      if (!child.textContent?.trim()) continue;
      const range = node.ownerDocument.createRange();
      range.selectNodeContents(child);
      for (const rect of range.getClientRects()) {
        lines.push({ top: rect.top, bottom: rect.bottom });
      }
    }
    return lines;
  });
}

withFramework(
  import.meta.dirname,
  { route: "badge" },
  async ({ test, query }) => {
    test("a badge sits on the line of the text around it", async ({ q }) => {
      const box = query(q.article("In running text"));
      const badge = box.text("v0.2").locator("..");
      const paragraph = badge.locator("..");
      // A block badge breaks the paragraph around it onto three lines and
      // stretches to the width of the paragraph.
      const lines = await getTextLines(paragraph);
      const [first] = lines;
      test.expect(lines).toHaveLength(2);
      if (!first) return;
      for (const line of lines) {
        test.expect(line.top).toBeCloseTo(first.top, 0);
      }
      const badgeBox = await badge.boundingBox();
      test.expect(badgeBox).not.toBeNull();
      if (!badgeBox) return;
      test.expect(badgeBox.y).toBeLessThan(first.bottom);
      test.expect(badgeBox.y + badgeBox.height).toBeGreaterThan(first.top);
      test.expect(badgeBox.width).toBeLessThan(100);
      // Phrasing content, so the parser keeps it inside the paragraph.
      await test.expect(badge).toHaveJSProperty("tagName", "SPAN");
    });

    test("a badge in a heading takes the heading's font size", async ({
      q,
    }) => {
      const box = query(q.article("Auto size in a heading"));
      const heading = box.heading(/^Changelog/);
      const badge = box.text("Latest").locator("..");
      // A heading holds phrasing content only.
      await test.expect(heading.locator(":scope > div")).toHaveCount(0);
      await test.expect(badge).toHaveJSProperty("tagName", "SPAN");
      const fontSize = await heading.evaluate(
        (node) => getComputedStyle(node).fontSize,
      );
      await test.expect(badge).toHaveCSS("font-size", fontSize);
    });
  },
);
