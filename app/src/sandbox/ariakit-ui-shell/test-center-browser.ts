import { expect } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";
import {
  expectAligned,
  expectCentered,
  getCenterOffset,
  getShell,
  sampleCenterOffset,
  selectScenario,
} from "./test-helpers.ts";

// The 300ms fold of the shell, plus a frame.
const FOLD_MS = 350;
// The 900ms fold of the "Slow window folds" option, plus a frame.
const SLOW_FOLD_MS = 950;

withFramework(import.meta.dirname, async ({ test }) => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test.beforeEach(async ({ q }) => {
    await selectScenario(q, "center");
  });

  for (const direct of [false, true]) {
    const place = direct ? "directly inside the outer shell" : "in a panel";
    test(`keeps the chat ${place} on the window center while sidebars open and close`, async ({
      page,
      q,
    }) => {
      if (direct) {
        await q.checkbox("Directly inside").check();
      }
      const conversation = q.group("Conversation");
      const outerShell = getShell(page);
      await expectCentered(conversation, outerShell);
      // The end sidebar of the window comes after main in the DOM.
      for (const name of [
        "Start sidebar",
        "End sidebar",
        "Settings",
        "Start sidebar",
        "End sidebar",
        "Settings",
      ]) {
        await q.checkbox(name).click();
        const largest = await sampleCenterOffset(
          page,
          conversation,
          outerShell,
          FOLD_MS,
        );
        expect(largest).toBeLessThan(1);
        await expectCentered(conversation, outerShell);
      }
    });

    test(`ignores an open window sidebar that $show hides for the chat ${place}`, async ({
      page,
      q,
    }) => {
      // The start sidebar is open but hidden below 48rem.
      await page.setViewportSize({ width: 760, height: 900 });
      if (direct) {
        await q.checkbox("Directly inside").check();
      }
      await q.checkbox("Settings").uncheck();
      await expect(q.navigation("Start sidebar")).toBeHidden();
      await expectCentered(q.group("Conversation"), getShell(page));
    });

    test(`keeps the chat ${place} on the window center in right-to-left pages`, async ({
      page,
      q,
    }) => {
      await q.checkbox("Right to left").check();
      if (direct) {
        await q.checkbox("Directly inside").check();
      }
      const conversation = q.group("Conversation");
      const outerShell = getShell(page);
      await expectCentered(conversation, outerShell);
      await q.checkbox("End sidebar").check();
      await expectCentered(conversation, outerShell);
      await q.checkbox("Start sidebar").uncheck();
      await expectCentered(conversation, outerShell);
    });

    test(`keeps the chat ${place} on the window center during slower window folds`, async ({
      page,
      q,
    }) => {
      // The window folds in 900ms, and the chat sets no duration of its own.
      await q.checkbox("Slow window folds").check();
      if (direct) {
        await q.checkbox("Directly inside").check();
      }
      const conversation = q.group("Conversation");
      const outerShell = getShell(page);
      await expectCentered(conversation, outerShell);
      for (const name of ["Start sidebar", "End sidebar"]) {
        await q.checkbox(name).click();
        const largest = await sampleCenterOffset(
          page,
          conversation,
          outerShell,
          SLOW_FOLD_MS,
        );
        expect(largest).toBeLessThan(1);
      }
    });
  }

  test("centers the chat on its own shell by default", async ({ page, q }) => {
    await q.checkbox("Center on the outer shell").uncheck();
    const conversation = q.group("Conversation");
    const outerShell = getShell(page);
    // Half the 320px start sidebar to the right of the window center.
    await expect
      .poll(() => getCenterOffset(conversation, outerShell))
      .toBeCloseTo(160, 0);
  });

  test("keeps the chat header area on the conversation column", async ({
    page,
    q,
  }) => {
    await q.checkbox("Chat header").check();
    const area = q.group("Chat header area");
    const conversation = q.group("Conversation");
    await expectAligned(area, conversation);
    await expectCentered(area, getShell(page));
    await q.checkbox("Start sidebar").uncheck();
    await expectAligned(area, conversation);
    await q.checkbox("End sidebar").check();
    await expectAligned(area, conversation);
    await expectCentered(area, getShell(page));
  });
});
