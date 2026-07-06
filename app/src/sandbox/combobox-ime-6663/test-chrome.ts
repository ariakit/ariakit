import type { CDPSession, Page } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

interface ImeTraceEvent {
  data?: string;
  role?: string | null;
  type: string;
}

declare global {
  interface Window {
    __comboboxImeEvents?: ImeTraceEvent[];
  }
}

async function traceImeEvents(page: Page) {
  await page.evaluate(() => {
    const events: ImeTraceEvent[] = [];
    window.__comboboxImeEvents = events;
    for (const type of ["compositionstart", "compositionend", "focusin"]) {
      document.addEventListener(
        type,
        (event) => {
          const target = event.target as HTMLElement | null;
          const data =
            event instanceof CompositionEvent ? event.data : undefined;
          events.push({
            type,
            data,
            role: target?.getAttribute("role"),
          });
        },
        true,
      );
    }
  });
}

async function setComposition(cdp: CDPSession, text: string) {
  await cdp.send("Input.imeSetComposition", {
    text,
    selectionStart: text.length,
    selectionEnd: text.length,
  });
}

// Reproduces https://github.com/ariakit/ariakit/issues/6663
withFramework(import.meta.dirname, async ({ test }) => {
  test("keeps DOM focus in the combobox between Korean IME syllables", async ({
    page,
    q,
  }) => {
    const combobox = q.combobox("Fruit");
    const cdp = await page.context().newCDPSession(page);

    await combobox.focus();
    await traceImeEvents(page);

    // This CDP sequence is derived from a real macOS Korean 2-set trace for
    // typing t k r h k, which should produce 사과. CDP preserves the final
    // value, but it still exposes the harmful focus move that makes the native
    // macOS IME drop the composed 고 syllable and produce 사ㅏ.
    await setComposition(cdp, "ㅅ");
    await setComposition(cdp, "사");
    await setComposition(cdp, "삭");
    await setComposition(cdp, "사");
    await cdp.send("Input.insertText", { text: "사" });
    await setComposition(cdp, "고");

    const focusMove = await page.evaluate(() => {
      const events = window.__comboboxImeEvents ?? [];
      const end = events.findIndex(
        (event) => event.type === "compositionend" && event.data === "사",
      );
      const start = events.findIndex(
        (event, index) => index > end && event.type === "compositionstart",
      );
      const movedToOption =
        end >= 0 &&
        start > end &&
        events
          .slice(end + 1, start)
          .some((event) => event.type === "focusin" && event.role === "option");
      return { end, events, movedToOption, start };
    });
    test.expect(focusMove.end).toBeGreaterThanOrEqual(0);
    test.expect(focusMove.start).toBeGreaterThan(focusMove.end);
    test.expect(focusMove.movedToOption).toBe(false);

    await setComposition(cdp, "과");
    await cdp.send("Input.insertText", { text: "과" });

    await test.expect(combobox).toHaveValue("사과");
    await test.expect(q.text("Current keyword: 사과")).toBeVisible();
  });
});
