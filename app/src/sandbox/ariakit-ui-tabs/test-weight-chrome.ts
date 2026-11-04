import type { Locator } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

// Folder, flat, and bevel tabs, with label text from TabLabel children, from
// Tab children, alone or mixed with an expression or a bigint, from the tabs
// prop, from a grown label, and from the text prop of a label with an element
// child.
const textLists = [
  "Folder tabs",
  "Flat tabs",
  "Bevel tabs",
  "Bar placement",
  "Project updates",
  "Tabs record",
  "Tabs with bigint counts",
  "Grown tab labels",
  "Rich tab labels",
];

// The label of these tabs has an element child and no text prop.
const untextedLists = ["Rich tab labels without text"];

// The labels or the tabs of these lists have a weight class, which applies to
// every tab in the default contrast.
const weightClassLists = [
  { name: "Semibold tab labels", weight: 600 },
  { name: "Medium tabs", weight: 500 },
];

// The weight of the first text in each tab, which comes from its label.
function getWeights(tabs: Locator) {
  return tabs.evaluateAll((nodes) =>
    nodes.map((node) => {
      const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
      let text = walker.nextNode();
      while (text && !text.textContent?.trim()) {
        text = walker.nextNode();
      }
      const element = text?.parentElement ?? node;
      return Number(getComputedStyle(element).fontWeight);
    }),
  );
}

function getWidths(tabs: Locator) {
  return tabs.evaluateAll((nodes) =>
    nodes.map((node) => node.getBoundingClientRect().width),
  );
}

withFramework(import.meta.dirname, async ({ query, test }) => {
  for (const name of textLists) {
    test(`gives only the selected tab the heavier weight in ${name}`, async ({
      q,
    }) => {
      const list = query(q.tablist(name));
      const enabled = list.tab(undefined, { disabled: false });
      for (const tab of await enabled.all()) {
        await tab.click();
        await test.expect(tab).toHaveAttribute("aria-selected", "true");
        const [selected] = await getWeights(tab);
        const others = await getWeights(
          list.tab(undefined, { selected: false }),
        );
        test.expect(others.length).toBeGreaterThan(0);
        for (const weight of others) {
          test.expect(selected).toBeGreaterThan(weight);
        }
      }
    });
  }

  for (const name of untextedLists) {
    test(`keeps the normal weight on every tab in ${name}`, async ({ q }) => {
      const list = query(q.tablist(name));
      for (const tab of await list.tab().all()) {
        await tab.click();
        await test.expect(tab).toHaveAttribute("aria-selected", "true");
        const weights = await getWeights(list.tab());
        test.expect(new Set(weights)).toEqual(new Set([400]));
      }
    });
  }

  for (const { name, weight } of weightClassLists) {
    test(`keeps the weight class on every tab in ${name}`, async ({ q }) => {
      const list = query(q.tablist(name));
      for (const tab of await list.tab().all()) {
        await tab.click();
        await test.expect(tab).toHaveAttribute("aria-selected", "true");
        const weights = await getWeights(list.tab());
        test.expect(new Set(weights)).toEqual(new Set([weight]));
      }
    });
  }

  const weightClassNames = weightClassLists.map(({ name }) => name);
  for (const name of [...textLists, ...untextedLists, ...weightClassNames]) {
    test(`keeps the width of each tab when the selection moves in ${name}`, async ({
      q,
    }) => {
      const list = query(q.tablist(name));
      const tabs = list.tab();
      const widths = await getWidths(tabs);
      const enabled = list.tab(undefined, { disabled: false });
      for (const tab of await enabled.all()) {
        await tab.click();
        await test.expect(tab).toHaveAttribute("aria-selected", "true");
        // The press scales the tab down for a moment, so the widths are polled.
        await test.expect.poll(() => getWidths(tabs)).toEqual(widths);
      }
    });
  }
});
