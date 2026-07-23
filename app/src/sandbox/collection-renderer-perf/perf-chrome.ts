import type { query } from "@ariakit/test/playwright";
import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

const groupCount = 200;
const itemsPerGroup = 50;
const itemSize = 20;
const groupSize = itemsPerGroup * itemSize;
const updateCount = 20;
const toggleCount = 10;
const scrollGroupIndices = Array.from({ length: 20 }, (_, index) => {
  return Math.min((index + 1) * 10, groupCount - 1);
});

type Query = ReturnType<typeof query>;

function getGroupFirstItemLabel(groupIndex: number) {
  return `Item ${groupIndex * itemsPerGroup + 1}`;
}

async function verifyRendererMounted(q: Query) {
  await expect(q.listitem("Item 10")).toBeVisible();
}

async function mountRenderer(page: Page, q: Query) {
  await q.button("Mount nested renderers").click();
  await verifyRendererMounted(q);
  await flushFrames(page);
}

async function rerenderNestedRenderers(page: Page, q: Query) {
  const updateButton = q.button("Rerender nested renderers");
  for (let index = 0; index < updateCount; index += 1) {
    await updateButton.click();
  }
  await flushFrames(page);
  await expect(q.status("Updates")).toHaveText(String(updateCount));
  await expect(q.listitem("Item 10")).toHaveAttribute(
    "data-update",
    String(updateCount),
  );
}

async function verifyNestedRenderersUpdated(q: Query) {
  await expect(q.status("Updates")).toHaveText(String(updateCount));
  await expect(q.listitem("Item 10")).toHaveAttribute(
    "data-update",
    String(updateCount),
  );
}

async function toggleRendererItems(page: Page, q: Query) {
  const toggleButton = q.button("Toggle renderer items");
  for (let index = 0; index < toggleCount; index += 1) {
    const itemsVisible = index % 2 === 1;
    await toggleButton.click();
    await flushFrames(page);
    await expect(q.status("Items visible")).toHaveText(
      itemsVisible ? "yes" : "no",
    );
    await expect(q.listitem("Item 10")).toHaveCount(itemsVisible ? 1 : 0);
  }
}

async function verifyRendererItemsVisible(q: Query) {
  await expect(q.status("Items visible")).toHaveText("yes");
  await expect(q.listitem("Item 10")).toBeVisible();
}

async function scrollNestedRenderers(page: Page, q: Query) {
  const scroller = q.region("Renderer viewport");
  for (const groupIndex of scrollGroupIndices) {
    await scroller.evaluate((element, scrollTop) => {
      element.scrollTop = scrollTop;
      element.dispatchEvent(new Event("scroll"));
    }, groupIndex * groupSize);
    await flushFrames(page);
    await expect(q.listitem(getGroupFirstItemLabel(groupIndex))).toBeVisible();
  }
}

async function verifyRendererScrolled(q: Query) {
  const finalGroupIndex = scrollGroupIndices.at(-1) ?? groupCount - 1;
  await expect(q.listitem("Item 1")).toHaveCount(0);
  await expect(
    q.listitem(getGroupFirstItemLabel(finalGroupIndex)),
  ).toBeVisible();
}

withFramework(import.meta.dirname, async ({ test }) => {
  test("mount nested renderers", async ({ perf }) => {
    await perf.measure(({ page, q }) => mountRenderer(page, q), {
      verify: ({ q }) => verifyRendererMounted(q),
    });
  });

  test("rerender nested renderers", async ({ perf }) => {
    await perf.measure(({ page, q }) => rerenderNestedRenderers(page, q), {
      setup: ({ page, q }) => mountRenderer(page, q),
      scriptProfile: true,
      profileLimit: 20,
      verify: ({ q }) => verifyNestedRenderersUpdated(q),
    });
  });

  test("toggle renderer items", async ({ perf }) => {
    await perf.measure(({ page, q }) => toggleRendererItems(page, q), {
      setup: ({ page, q }) => mountRenderer(page, q),
      verify: ({ q }) => verifyRendererItemsVisible(q),
    });
  });

  test("scroll nested renderers", async ({ perf }) => {
    await perf.measure(({ page, q }) => scrollNestedRenderers(page, q), {
      setup: ({ page, q }) => mountRenderer(page, q),
      verify: ({ q }) => verifyRendererScrolled(q),
    });
  });
});
