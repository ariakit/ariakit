import type { Locator } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

// Raised, flat, and icon radio segments, and segmented tabs from children and
// from the tabs prop.
const groups = [
  { name: "Raised", role: "radiogroup", item: "radio" },
  { name: "Flat", role: "radiogroup", item: "radio" },
  { name: "Icons with labels", role: "radiogroup", item: "radio" },
  { name: "Project", role: "tablist", item: "tab" },
  { name: "Period", role: "tablist", item: "tab" },
] as const;

// The weight of the first text in each segment, which comes from its label. A
// radio input covers its segment, so the segment is the label around it.
function getWeights(items: Locator) {
  return items.evaluateAll((nodes) =>
    nodes.map((node) => {
      const segment = node.closest("label") ?? node;
      const walker = document.createTreeWalker(segment, NodeFilter.SHOW_TEXT);
      let text = walker.nextNode();
      while (text && !text.textContent?.trim()) {
        text = walker.nextNode();
      }
      const element = text?.parentElement ?? segment;
      return Number(getComputedStyle(element).fontWeight);
    }),
  );
}

function getWidths(items: Locator) {
  return items.evaluateAll((nodes) =>
    nodes.map((node) => node.getBoundingClientRect().width),
  );
}

withFramework(import.meta.dirname, async ({ query, test }) => {
  const expectSelected = async (segment: Locator, item: "radio" | "tab") => {
    if (item === "radio") {
      await test.expect(segment).toBeChecked();
      return;
    }
    await test.expect(segment).toHaveAttribute("aria-selected", "true");
  };

  for (const { name, role, item } of groups) {
    test(`gives only the selected segment the heavier weight in ${name}`, async ({
      q,
    }) => {
      const group = query(q[role](name));
      const enabled = group[item](undefined, { disabled: false });
      const unselected =
        item === "radio"
          ? group.radio(undefined, { checked: false })
          : group.tab(undefined, { selected: false });
      for (const segment of await enabled.all()) {
        await segment.click();
        await expectSelected(segment, item);
        const [selected] = await getWeights(segment);
        const others = await getWeights(unselected);
        test.expect(others.length).toBeGreaterThan(0);
        for (const weight of others) {
          test.expect(selected).toBeGreaterThan(weight);
        }
      }
    });

    test(`keeps the width of each segment when the selection moves in ${name}`, async ({
      q,
    }) => {
      const group = query(q[role](name));
      const items = group[item]();
      const widths = await getWidths(items);
      const enabled = group[item](undefined, { disabled: false });
      for (const segment of await enabled.all()) {
        await segment.click();
        await expectSelected(segment, item);
        // The press scales the segment down for a moment, so the widths are
        // polled.
        await test.expect.poll(() => getWidths(items)).toEqual(widths);
      }
    });
  }
});
