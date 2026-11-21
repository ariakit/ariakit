import type { Locator, Page } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";
import { getGrowthGap } from "./test-helpers.ts";

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

  // Chrome grows a new tab from no width. A browser that can't animate a width
  // to auto shows the whole tab at once, so the strip can't scroll before the
  // tab has grown there.
  test("scrolls a full row to a new note before the note has grown in", async ({
    page,
    q,
  }) => {
    await page.setViewportSize({ width: 900, height: 500 });
    const newNote = q.button("New note");
    for (let count = 1; count <= 4; count++) {
      await newNote.click();
    }
    await test.expect(q.tab("Note 4")).toBeInViewport({ ratio: 1 });
    await test.expect
      .poll(() => getGrowthGap(q.tab("Note 4"), q.tab("Note 3")))
      .toBeLessThan(0.5);
    // The growth and the scroll are motion, so this reads the strip and the new
    // tab after each frame of the growth.
    const { start, frames } = await newNote.evaluate(async (button) => {
      const strip = document.querySelector("[role='tablist']");
      const samples: Array<{ scroll: number; width: number }> = [];
      if (!strip || !(button instanceof HTMLElement)) {
        return { start: 0, frames: samples };
      }
      const start = strip.scrollLeft;
      button.click();
      for (let frame = 0; frame < 30; frame++) {
        await new Promise((resolve) => {
          requestAnimationFrame(() => setTimeout(resolve));
        });
        const tabs = strip.querySelectorAll("[role='tab']");
        const tab = tabs[tabs.length - 1];
        if (!tab) continue;
        samples.push({
          scroll: strip.scrollLeft,
          width: tab.getBoundingClientRect().width,
        });
      }
      return { start, frames: samples };
    });
    const last = frames.at(-1);
    if (!last) {
      throw new Error("The strip has no frames");
    }
    test.expect(last.scroll).toBeGreaterThan(start + 1);
    // The strip reaches its place while the note still grows, so the note grows
    // where it shows.
    const arrived = frames.find((frame) => frame.scroll >= last.scroll - 0.5);
    test.expect(arrived?.width).toBeLessThan(last.width - 1);
    // The strip never scrolls back, such as when the room for the note goes.
    for (const [index, frame] of frames.entries()) {
      const previous = frames[index - 1];
      if (!previous) continue;
      test.expect(frame.scroll).toBeGreaterThanOrEqual(previous.scroll - 0.5);
    }
    await test.expect(q.tab("Note 5")).toBeInViewport({ ratio: 1 });
  });

  test("scrolls a full row once to a new note after quick presses", async ({
    page,
    q,
  }) => {
    await page.setViewportSize({ width: 900, height: 500 });
    const newNote = q.button("New note");
    for (let count = 1; count <= 3; count++) {
      await newNote.click();
    }
    // The scroll is motion, so this reads the strip and the new tab after each
    // frame.
    const frames = await newNote.evaluate(async (button) => {
      const strip = document.querySelector("[role='tablist']");
      if (!strip || !(button instanceof HTMLElement)) return [];
      const samples: Array<{ scroll: number; width: number; hidden: number }> =
        [];
      // The second press comes one frame after the first, so the note before
      // the last one still grows when the last one comes.
      button.click();
      await new Promise((resolve) => requestAnimationFrame(resolve));
      button.click();
      for (let frame = 0; frame < 24; frame++) {
        await new Promise((resolve) => {
          requestAnimationFrame(() => setTimeout(resolve));
        });
        const tabs = strip.querySelectorAll("[role='tab']");
        const tab = tabs[tabs.length - 1];
        if (!tab) continue;
        const tabRect = tab.getBoundingClientRect();
        samples.push({
          scroll: strip.scrollLeft,
          width: tabRect.width,
          hidden: tabRect.right - strip.getBoundingClientRect().right,
        });
      }
      return samples;
    });
    test.expect(frames.length).toBeGreaterThan(10);
    for (const [index, frame] of frames.entries()) {
      const previous = frames[index - 1];
      if (!previous) continue;
      test.expect(frame.scroll).toBeGreaterThanOrEqual(previous.scroll - 0.5);
    }
    // The strip goes to the grown note, and not to where the note is while the
    // notes before it still grow. A strip that stopped short would leave the
    // grown note past its end until it scrolled again.
    const grownFrames = frames.filter((frame) => frame.width > 0);
    test
      .expect(Math.max(...grownFrames.map((frame) => frame.hidden)))
      .toBeLessThan(1);
  });

  // An app can render a large panel as a tab opens. A new transition takes its
  // start time on the next frame, so the note starts to grow after that long
  // task.
  test("brings a new note into view after a long task", async ({ page, q }) => {
    await page.setViewportSize({ width: 900, height: 500 });
    const newNote = q.button("New note");
    for (let count = 1; count <= 4; count++) {
      await newNote.click();
    }
    await test.expect(q.tab("Note 4")).toBeInViewport({ ratio: 1 });
    await newNote.evaluate((button) => {
      const strip = document.querySelector("[role='tablist']");
      if (!strip || !(button instanceof HTMLElement)) return;
      // The strip keeps the room of the new note in its end padding as the
      // scroll starts, so the long task runs right after that, before the next
      // frame.
      const observer = new MutationObserver(() => {
        observer.disconnect();
        const end = performance.now() + 300;
        while (performance.now() < end) {
          // The long task keeps the page busy.
        }
      });
      observer.observe(strip, { attributes: true, attributeFilter: ["style"] });
      button.click();
    });
    await test.expect(q.tab("Note 5")).toHaveAttribute("aria-selected", "true");
    await test.expect(q.tab("Note 5")).toBeInViewport({ ratio: 1 });
  });

  test("brings a new note into view when it gets the selection back as it grows in", async ({
    page,
    q,
  }) => {
    await page.setViewportSize({ width: 900, height: 500 });
    const newNote = q.button("New note");
    for (let count = 1; count <= 4; count++) {
      await newNote.click();
    }
    await test.expect(q.tab("Note 4")).toBeInViewport({ ratio: 1 });
    // The selection moves while the new note still grows in, so this presses
    // the tabs in the page. The note ends its enter on a timer with the growth
    // time, so the presses on timers with no delay come before it.
    await newNote.evaluate(async (button) => {
      const strip = document.querySelector("[role='tablist']");
      if (!strip || !(button instanceof HTMLElement)) return;
      const nextTask = () => new Promise((resolve) => setTimeout(resolve));
      button.click();
      await nextTask();
      const tabs = strip.querySelectorAll<HTMLElement>("[role='tab']");
      tabs[tabs.length - 2]?.click();
      await nextTask();
      tabs[tabs.length - 1]?.click();
    });
    await test.expect(q.tab("Note 5")).toHaveAttribute("aria-selected", "true");
    await test.expect(q.tab("Note 5")).toBeInViewport({ ratio: 1 });
  });
});
