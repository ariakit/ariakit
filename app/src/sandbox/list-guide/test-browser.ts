import type { Locator } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

interface Box {
  left: number;
  right: number;
  top: number;
  bottom: number;
  width: number;
  height: number;
}

function getBox(locator: Locator) {
  return locator.evaluate((element): Box => {
    const rect = element.getBoundingClientRect();
    return {
      left: rect.left,
      right: rect.right,
      top: rect.top,
      bottom: rect.bottom,
      width: rect.width,
      height: rect.height,
    };
  });
}

function getCentre(box: Box) {
  return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
}

// The marker and the guide are presentational: the marker is hidden from
// assistive tech unless it holds a check, and the guide always is. They are the
// two things here reached through the DOM.
function getMarker(row: Locator) {
  return row.locator(".list-marker").first();
}

function getGuide(row: Locator) {
  return row.locator(".list-guide").first();
}

/**
 * Where the row's text starts, from a range over its first text node.
 */
function getTextStart(row: Locator) {
  return row.evaluate((element) => {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
      if (node.textContent?.trim()) {
        const range = document.createRange();
        range.selectNodeContents(node);
        return range.getBoundingClientRect().left;
      }
      node = walker.nextNode();
    }
    throw new Error("No text in the row");
  });
}

/**
 * The lengths a row's text inset is made of: its frame padding, its line height
 * and the cap height of its font, measured in the row itself.
 */
function getRowMetrics(row: Locator) {
  return row.evaluate((element) => {
    const style = getComputedStyle(element);
    const probe = document.createElement("span");
    probe.style.display = "block";
    probe.style.height = "1cap";
    element.append(probe);
    const cap = probe.getBoundingClientRect().height;
    probe.remove();
    return {
      padding: parseFloat(style.paddingBlockStart),
      lineHeight: parseFloat(style.lineHeight),
      cap,
    };
  });
}

withFramework(import.meta.dirname, async ({ test, query }) => {
  test("the guide runs from a marker's centre to the next one's", async ({
    q,
  }) => {
    const rows = query(q.list("Steps")).listitem();
    const count = await rows.count();
    for (let i = 0; i < count - 1; i += 1) {
      const row = rows.nth(i);
      const guide = getGuide(row);
      await test.expect(guide).toBeVisible();
      const segment = await getBox(guide);
      const marker = getCentre(await getBox(getMarker(row)));
      const next = getCentre(await getBox(getMarker(rows.nth(i + 1))));
      test.expect(segment.left + segment.width / 2).toBeCloseTo(marker.x, 0);
      test.expect(segment.top).toBeCloseTo(marker.y, 0);
      test.expect(segment.bottom).toBeCloseTo(next.y, 0);
    }
    // The last segment leaves its marker and stops inside its own row.
    const last = rows.nth(count - 1);
    const segment = await getBox(getGuide(last));
    const marker = getCentre(await getBox(getMarker(last)));
    const row = await getBox(last);
    test.expect(segment.top).toBeCloseTo(marker.y, 0);
    test.expect(segment.bottom).toBeLessThanOrEqual(row.bottom + 0.5);
  });

  test("a marker sits over the guide inside a halo of the surface", async ({
    q,
  }) => {
    const row = query(q.list("Steps")).listitem().first();
    const marker = getMarker(row);
    const guide = getGuide(row);
    const [markerIndex, guideIndex] = await Promise.all([
      marker.evaluate((element) => Number(getComputedStyle(element).zIndex)),
      guide.evaluate((element) => Number(getComputedStyle(element).zIndex)),
    ]);
    test.expect(markerIndex).toBeGreaterThan(guideIndex);
    const halo = await marker.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        width: parseFloat(style.outlineWidth),
        matchesSurface:
          style.outlineColor ===
          style.getPropertyValue("--ak-layer-parent").trim(),
      };
    });
    test.expect(halo.width).toBeGreaterThan(0);
    test.expect(halo.matchesSurface).toBe(true);
  });

  test("an unordered list draws a guide only when asked", async ({ q }) => {
    const plain = query(q.list("Plain")).listitem().first();
    await test.expect(getGuide(plain)).toBeHidden();
    const rows = query(q.list("Timeline")).listitem();
    const first = rows.first();
    const guide = getGuide(first);
    await test.expect(guide).toBeVisible();
    // Bullets replace the dashes: the marker is a small disc, well under the
    // line box, centred on the guide.
    const marker = await getBox(getMarker(first));
    const { lineHeight } = await getRowMetrics(first);
    test.expect(marker.width).toBeLessThan(lineHeight / 3);
    test.expect(marker.width).toBeCloseTo(marker.height, 0);
    const segment = await getBox(guide);
    test
      .expect(segment.left + segment.width / 2)
      .toBeCloseTo(getCentre(marker).x, 0);
    // The dash stays a wide, flat line.
    const dash = await getBox(getMarker(plain));
    test.expect(dash.width).toBeGreaterThan(dash.height * 4);
  });

  test("an ordered list can turn its guide off", async ({ q }) => {
    const row = query(q.list("No guide")).listitem().first();
    await test.expect(getGuide(row)).toBeHidden();
  });

  test("a disclosure row's guide follows its open content", async ({
    page,
    q,
  }) => {
    const rows = query(q.list("Steps with details")).listitem();
    const row = rows.first();
    const next = rows.nth(1);
    const guide = getGuide(row);
    const before = await getBox(guide);
    const button = q.button("Show details");
    await button.click();
    await test.expect(button).toHaveAttribute("aria-expanded", "true");
    // The content grows over the disclosure's transition, clipped to its
    // animated height, so it is fully open once its box holds all of it.
    const contentId = await button.getAttribute("aria-controls");
    const content = page.locator(`[id="${contentId}"]`);
    await test.expect
      .poll(() =>
        content.evaluate(
          (element) => element.clientHeight >= element.scrollHeight,
        ),
      )
      .toBe(true);
    const after = await getBox(guide);
    test.expect(after.height).toBeGreaterThan(before.height);
    const marker = getCentre(await getBox(getMarker(next)));
    test.expect(after.bottom).toBeCloseTo(marker.y, 0);
  });

  test("the guide mirrors under the marker in a right-to-left list", async ({
    q,
  }) => {
    const rows = query(q.list("Right to left")).listitem();
    const row = rows.first();
    const box = await getBox(row);
    const marker = getCentre(await getBox(getMarker(row)));
    const segment = await getBox(getGuide(row));
    test.expect(marker.x).toBeGreaterThan(box.left + box.width / 2);
    test.expect(segment.left + segment.width / 2).toBeCloseTo(marker.x, 0);
    const next = getCentre(await getBox(getMarker(rows.nth(1))));
    test.expect(segment.bottom).toBeCloseTo(next.y, 0);
  });

  test("the text starts one control inset past the marker column", async ({
    q,
  }) => {
    const row = query(q.list("Plain")).listitem().first();
    const box = await getBox(row);
    const { padding, lineHeight, cap } = await getRowMetrics(row);
    const textStart = await getTextStart(row);
    // The column is one line box at the frame padding; the text follows it
    // after the control's optical side padding, half the room a line leaves
    // above and below its capitals (see padding.ts).
    const inset = padding + (lineHeight - cap) / 2;
    test.expect(textStart - box.left).toBeCloseTo(inset + lineHeight, 0);
  });
});
