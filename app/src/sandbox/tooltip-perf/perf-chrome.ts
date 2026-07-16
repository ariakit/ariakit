import { query } from "@ariakit/test/playwright";
import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

const moveCount = 121;
type Query = ReturnType<typeof query>;

interface ToolbarCase {
  label: string;
  hasTooltip: boolean;
}

const independentTooltips = {
  label: "Independent tooltips",
  hasTooltip: true,
} satisfies ToolbarCase;

const sharedTooltip = {
  label: "Shared tooltip",
  hasTooltip: true,
} satisfies ToolbarCase;

const noTooltips = {
  label: "No tooltips",
  hasTooltip: false,
} satisfies ToolbarCase;

function getToolbar(q: Query, toolbarCase: ToolbarCase) {
  return q.toolbar(toolbarCase.label);
}

function getItem(q: Query, toolbarCase: ToolbarCase, name: string) {
  const toolbar = getToolbar(q, toolbarCase);
  return query(toolbar).button(name);
}

function getTooltip(q: Query, toolbarCase: ToolbarCase, item: string) {
  return q.tooltip(`${toolbarCase.label}: ${item}`);
}

async function setupToolbar(page: Page, q: Query, toolbarCase: ToolbarCase) {
  const toolbar = getToolbar(q, toolbarCase);
  const firstItem = getItem(q, toolbarCase, "Tool 1");
  await firstItem.focus();
  await page.keyboard.press("ArrowRight");
  await expect(getItem(q, toolbarCase, "Tool 2")).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(getItem(q, toolbarCase, "Tool 3")).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(firstItem).toBeFocused();
  if (toolbarCase.hasTooltip) {
    await expect(getTooltip(q, toolbarCase, "Tool 1")).toBeVisible();
  }
  await toolbar.evaluate((element, expectedMoveCount) => {
    const items = Array.from(element.querySelectorAll("button"));
    // Setup ends on the first item, so measured moves must repeat 2 → 3 → 1.
    const expectedItems = [items[1], items[2], items[0]];
    let actualMoveCount = 0;
    let valid = true;
    element.addEventListener("focusin", (event) => {
      if (!valid) return;
      const expectedItem =
        expectedItems[actualMoveCount % expectedItems.length];
      actualMoveCount += 1;
      if (
        event.target !== expectedItem ||
        actualMoveCount > expectedMoveCount
      ) {
        valid = false;
        element.setAttribute("data-move-count", "invalid");
        return;
      }
      if (actualMoveCount === expectedMoveCount) {
        element.setAttribute("data-move-count", String(actualMoveCount));
      }
    });
  }, moveCount);
}

async function moveAcrossItems(page: Page) {
  for (let index = 0; index < moveCount; index++) {
    await page.keyboard.press("ArrowRight");
  }
}

async function verifyMovedAcrossItems(q: Query, toolbarCase: ToolbarCase) {
  const toolbar = getToolbar(q, toolbarCase);
  await expect(toolbar).toHaveAttribute("data-move-count", String(moveCount));
  await expect(getItem(q, toolbarCase, "Tool 2")).toBeFocused();
  if (toolbarCase.hasTooltip) {
    await expect(getTooltip(q, toolbarCase, "Tool 2")).toBeVisible();
  }
  await expect(q.tooltip()).toHaveCount(toolbarCase.hasTooltip ? 1 : 0);
}

// https://github.com/ariakit/ariakit/issues/4428
withFramework(import.meta.dirname, async ({ test }) => {
  test("move across items with independent tooltips", async ({ perf }) => {
    await perf.measure(({ page }) => moveAcrossItems(page), {
      scriptProfile: true,
      profileLimit: 20,
      setup: ({ page, q }) => setupToolbar(page, q, independentTooltips),
      verify: ({ q }) => verifyMovedAcrossItems(q, independentTooltips),
    });
  });

  test("move across items with a shared tooltip", async ({ perf }) => {
    await perf.measure(({ page }) => moveAcrossItems(page), {
      setup: ({ page, q }) => setupToolbar(page, q, sharedTooltip),
      verify: ({ q }) => verifyMovedAcrossItems(q, sharedTooltip),
    });
  });

  test("move across items without tooltips", async ({ perf }) => {
    await perf.measure(({ page }) => moveAcrossItems(page), {
      setup: ({ page, q }) => setupToolbar(page, q, noTooltips),
      verify: ({ q }) => verifyMovedAcrossItems(q, noTooltips),
    });
  });
});
