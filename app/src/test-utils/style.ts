import type { Page } from "@playwright/test";
import { flushFrames } from "./preview.ts";

/**
 * Runs an action while Chrome traces style work and returns the largest number
 * of elements that one style recalculation updated. Chromium only.
 */
export async function largestStyleRecalculation(
  page: Page,
  action: () => Promise<void>,
) {
  const session = await page.context().newCDPSession(page);
  const counts: number[] = [];
  session.on("Tracing.dataCollected", ({ value }) => {
    for (const event of value) {
      if (event.name !== "UpdateLayoutTree") continue;
      const args: unknown = event.args;
      if (!args || typeof args !== "object") continue;
      if (!("elementCount" in args)) continue;
      const count = args.elementCount;
      if (typeof count !== "number") continue;
      counts.push(count);
    }
  });
  try {
    await session.send("Tracing.start", {
      categories: "devtools.timeline",
      transferMode: "ReportEvents",
    });
    await action();
    // Style invalidation is applied on the next rendering frame. The second
    // frame ensures that the trace includes it before recording stops.
    await flushFrames(page);
    const complete = new Promise<void>((resolve) => {
      session.once("Tracing.tracingComplete", () => resolve());
    });
    await session.send("Tracing.end");
    await complete;
    return Math.max(0, ...counts);
  } finally {
    await session.detach();
  }
}
