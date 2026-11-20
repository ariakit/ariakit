import type { Locator, Page } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

// The close mark is hidden from assistive technologies, so it has no role or
// name to query. It's the last element in its tab.
function getCloseMark(tab: Locator) {
  return tab.locator(":scope > :last-child");
}

interface WidthTransition {
  /** Whether a width transition started on the tab. */
  ran: boolean;
  /** Whether the tab was in the page when its width transition started. */
  ranBeforeRemoval: boolean;
}

interface WatchWidthTransitionParams {
  page: Page;
  /** The id of the tab to watch. */
  id: string;
  /**
   * The id of the element whose removal ends the watch, such as a tab that
   * closes. Without it, the watch ends with the width transition of the tab.
   */
  until?: string;
  action: () => Promise<void>;
}

/**
 * Watches a tab for a width transition, from before an action until the `until`
 * element is removed, or until the transition ends. The browser sends
 * transitionrun when it creates a transition, whatever the frame rate, so a
 * slow machine can't hide a transition, as it can between two frames.
 */
async function watchWidthTransition({
  page,
  id,
  until,
  action,
}: WatchWidthTransitionParams) {
  const watching = page.evaluate(
    ({ id, until }) =>
      new Promise<WidthTransition>((resolve) => {
        const result = { ran: false, ranBeforeRemoval: false };
        const isWidth = (event: TransitionEvent) => {
          if (event.propertyName !== "width") return false;
          return event.target instanceof Element && event.target.id === id;
        };
        const onRun = (event: TransitionEvent) => {
          if (!isWidth(event)) return;
          result.ran = true;
          result.ranBeforeRemoval = !!document.getElementById(id);
        };
        const onEnd = (event: TransitionEvent) => {
          if (until) return;
          if (isWidth(event)) finish();
        };
        const observer = new MutationObserver(() => {
          if (!until) return;
          if (!document.getElementById(until)) finish();
        });
        const finish = () => {
          observer.disconnect();
          document.removeEventListener("transitionrun", onRun, true);
          document.removeEventListener("transitionend", onEnd, true);
          document.removeEventListener("transitioncancel", onEnd, true);
          resolve(result);
        };
        observer.observe(document.body, { childList: true, subtree: true });
        document.addEventListener("transitionrun", onRun, true);
        document.addEventListener("transitionend", onEnd, true);
        // The tab drops its transition as its timer ends, which can cancel the
        // last frame of the transition.
        document.addEventListener("transitioncancel", onEnd, true);
      }),
    { id, until },
  );
  await action();
  return watching;
}

withFramework(import.meta.dirname, async ({ test }) => {
  test("closes a tab with its close mark and keeps focus and selection", async ({
    q,
  }) => {
    await q.tab("Groceries").click();
    await getCloseMark(q.tab("Workshop")).click();
    await test.expect(q.tab("Workshop")).toHaveCount(0);
    await test
      .expect(q.tab("Groceries"))
      .toHaveAttribute("aria-selected", "true");
    // The press on the mark doesn't take the focus from where it was.
    await test.expect(q.tab("Groceries")).toBeFocused();
  });

  test("moves the focus and the selection to the next tab with Delete", async ({
    q,
    page,
  }) => {
    await q.tab("Workshop").click();
    await page.keyboard.press("Delete");
    await test.expect(q.tab("Trip")).toBeFocused();
    await test.expect(q.tab("Trip")).toHaveAttribute("aria-selected", "true");
    await test.expect(q.tabpanel("Trip")).toContainText("night train");
    await test.expect(q.tab("Workshop")).toHaveCount(0);
  });

  test("moves to the previous tab when Backspace closes the last tab", async ({
    q,
    page,
  }) => {
    await q.tab("Trip").click();
    await page.keyboard.press("Backspace");
    await test.expect(q.tab("Workshop")).toBeFocused();
    await test
      .expect(q.tab("Workshop"))
      .toHaveAttribute("aria-selected", "true");
    await test.expect(q.tab("Trip")).toHaveCount(0);
  });

  test("opens a tab with a button that the Tab key reaches after the tabs", async ({
    q,
    page,
  }) => {
    await q.tab("Groceries").click();
    await page.keyboard.press("Tab");
    await test.expect(q.button("New note")).toBeFocused();
    await page.keyboard.press("Enter");
    await test.expect(q.tab("Note 1")).toHaveAttribute("aria-selected", "true");
    await test.expect(q.tab()).toHaveCount(4);
    await test.expect(q.button("New note")).toBeFocused();
  });

  test("shrinks a closed tab before it removes it", async ({ q, page }) => {
    const tab = q.tab("Workshop");
    const transition = await watchWidthTransition({
      page,
      id: "note-workshop",
      until: "note-workshop",
      action: () => getCloseMark(tab).click(),
    });
    await test.expect(tab).toHaveCount(0);
    test.expect(transition).toEqual({ ran: true, ranBeforeRemoval: true });
  });

  test("grows a new tab in", async ({ q, page }) => {
    const transition = await watchWidthTransition({
      page,
      id: "note-new-1",
      action: () => q.button("New note").click(),
    });
    await test.expect(q.tab("Note 1")).toBeVisible();
    test.expect(transition.ran).toBe(true);
  });

  test("closes a tab at once with reduced motion", async ({ q, page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const transition = await watchWidthTransition({
      page,
      id: "note-workshop",
      until: "note-workshop",
      action: () => getCloseMark(q.tab("Workshop")).click(),
    });
    await test.expect(q.tab("Workshop")).toHaveCount(0);
    test.expect(transition.ran).toBe(false);
  });

  test("closes one tab while Delete is held", async ({ q, page }) => {
    await q.tab("Groceries").click();
    await page.keyboard.down("Delete");
    // A second keydown without a keyup is the repeat of a held key.
    await page.keyboard.down("Delete");
    await page.keyboard.down("Delete");
    await page.keyboard.up("Delete");
    await test.expect(q.tab("Groceries")).toHaveCount(0);
    await test.expect(q.tab("Workshop")).toBeFocused();
    await test.expect(q.tab()).toHaveCount(2);
  });

  test("keeps the last tab still while the tab before it leaves", async ({
    q,
    page,
  }) => {
    await q.tab("Groceries").click();
    await page.keyboard.press("Delete");
    await test.expect(q.tab("Groceries")).toHaveCount(0);
    await test.expect(q.tab("Workshop")).toBeFocused();
    // Two presses in a row: Workshop leaves, and Trip gets the second press
    // while the example still counts two notes. Trip is then the only tab left,
    // so it must not start to leave and come back.
    const transition = await watchWidthTransition({
      page,
      id: "note-trip",
      until: "note-workshop",
      action: async () => {
        await page.keyboard.press("Delete");
        await page.keyboard.press("Delete");
      },
    });
    await test.expect(q.tab("Workshop")).toHaveCount(0);
    await test.expect(q.tab("Trip")).toBeFocused();
    test.expect(transition.ran).toBe(false);
  });
});
