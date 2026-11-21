import { expect } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";
import {
  expectCentered,
  getBox,
  getCenterOffset,
  getPanel,
  getShell,
  getSidebar,
  sampleCenterOffset,
  selectScenario,
} from "./test-helpers.ts";
import type { Query } from "./test-helpers.ts";

// The 300ms fold of the shell, plus a frame.
const FOLD_MS = 350;

interface FoldSample {
  edge: number;
  opacity: number;
  scale: number;
}

type Edge = "left" | "right";

const sidebars = [
  { side: "start", name: "Start sidebar", link: "All notes" },
  { side: "end", name: "End sidebar", link: "Note details" },
] as const;

/** The edge of a sidebar at the outer side of the shell. */
function getOuterEdge(side: "start" | "end", rtl: boolean): Edge {
  if (side === "start") return rtl ? "right" : "left";
  return rtl ? "left" : "right";
}

function getTravel(samples: FoldSample[]) {
  const edges = samples.map((sample) => sample.edge);
  return Math.max(...edges) - Math.min(...edges);
}

interface OpenSidebarParams {
  q: Query;
  name: string;
  link: string;
  edge: Edge;
}

/**
 * Opens a closed sidebar and samples a link of its panel on each frame, with
 * the opacity and the scale of the panel, until the column stops folding. The
 * fold is motion, so only samples in the page show how the panel moves.
 */
async function openSidebar({ q, name, link, edge }: OpenSidebarParams) {
  const checkbox = q.checkbox(name);
  // The end sidebar is open on the first render.
  if (await checkbox.isChecked()) {
    await checkbox.uncheck();
    await expect(q.link(link)).toBeHidden();
  }
  const panel = await getPanel(q, name).elementHandle();
  // The sampling starts before the click and takes its first sample when the
  // panel opens, before the browser paints the fold. Frames can come late on a
  // busy machine, so a first sample on a frame could miss the start.
  const samples = panel.evaluate(
    async (element, { linkName, outerEdge }) => {
      // The column that folds is the parent of the panel.
      const column = element.parentElement;
      const anchor = Array.from(element.querySelectorAll("a")).find(
        (item) => item.textContent === linkName,
      );
      const result: FoldSample[] = [];
      if (!column || !anchor) return result;
      await new Promise<void>((resolve) => {
        const observer = new MutationObserver(() => {
          if (!element.hasAttribute("data-open")) return;
          observer.disconnect();
          resolve();
        });
        observer.observe(element, { attributeFilter: ["data-open"] });
      });
      let lastWidth = Number.NaN;
      let still = 0;
      while (still < 5 && result.length < 300) {
        const style = getComputedStyle(element);
        result.push({
          edge: anchor.getBoundingClientRect()[outerEdge],
          opacity: Number.parseFloat(style.opacity),
          scale: style.scale === "none" ? 1 : Number.parseFloat(style.scale),
        });
        const width = column.getBoundingClientRect().width;
        still = width === lastWidth ? still + 1 : 0;
        lastWidth = width;
        await new Promise((resolve) => requestAnimationFrame(resolve));
      }
      return result;
    },
    { linkName: link, outerEdge: edge },
  );
  await checkbox.check();
  await expect(q.link(link)).toBeVisible();
  return samples;
}

withFramework(import.meta.dirname, async ({ test }) => {
  test.use({ viewport: { width: 1440, height: 900 } });

  for (const rtl of [false, true]) {
    const suffix = rtl ? " in right-to-left pages" : "";
    for (const { side, name, link } of sidebars) {
      const edge = getOuterEdge(side, rtl);
      for (const reveal of ["place", "zoom"] as const) {
        test(`keeps the ${side} sidebar links in place while the sidebar opens with ${reveal}${suffix}`, async ({
          q,
        }) => {
          await selectScenario(q, "reveal");
          if (rtl) {
            await q.checkbox("Right to left").check();
          }
          await q.combobox("Reveal").selectOption(reveal);
          const samples = await openSidebar({ q, name, link, edge });
          expect(samples.length).toBeGreaterThan(5);
          // With zoom, the panel grows from 95% of its size, from its top
          // corner at the outer side of the shell, so the edge of the link at
          // that side moves by less than a pixel. A panel that moves with main
          // would move by its whole width, and one that grows from the other
          // side by 5% of it.
          expect(getTravel(samples)).toBeLessThan(reveal === "zoom" ? 1.5 : 1);
        });
      }
    }
  }

  test("moves the sidebar panel with main by default", async ({ q }) => {
    await selectScenario(q, "reveal");
    await q.combobox("Reveal").selectOption("off");
    const samples = await openSidebar({
      q,
      name: "Start sidebar",
      link: "All notes",
      edge: "left",
    });
    // The panel slides in with the edge that faces main.
    expect(getTravel(samples)).toBeGreaterThan(100);
  });

  for (const { side, name, link } of sidebars) {
    test(`fades in and grows the ${side} sidebar panel with zoom`, async ({
      q,
    }) => {
      await selectScenario(q, "reveal");
      const samples = await openSidebar({
        q,
        name,
        link,
        edge: getOuterEdge(side, false),
      });
      const opacities = samples.map((sample) => sample.opacity);
      const scales = samples.map((sample) => sample.scale);
      expect(Math.min(...opacities)).toBeLessThan(0.8);
      expect(Math.min(...scales)).toBeLessThan(0.99);
      expect(Math.min(...scales)).toBeGreaterThanOrEqual(0.95);
      expect(samples.at(-1)?.opacity).toBe(1);
      expect(samples.at(-1)?.scale).toBe(1);
    });
  }

  test("doesn't fade or scale the sidebar panel with place", async ({ q }) => {
    await selectScenario(q, "reveal");
    await q.combobox("Reveal").selectOption("place");
    const samples = await openSidebar({
      q,
      name: "Start sidebar",
      link: "All notes",
      edge: "left",
    });
    expect(samples.every((sample) => sample.opacity === 1)).toBe(true);
    expect(samples.every((sample) => sample.scale === 1)).toBe(true);
  });

  test("doesn't animate a zoom sidebar that is open on the first render", async ({
    page,
    q,
  }) => {
    // The sampling starts before the scenario renders, so it sees the panel
    // from its first frame in the page, for longer than a fold.
    const samplesPromise = page.evaluate(
      (duration) =>
        new Promise<FoldSample[]>((resolve) => {
          const samples: FoldSample[] = [];
          let start = Number.NaN;
          const sample = () => {
            const panel = document.querySelector("[aria-label='End sidebar']");
            const link = Array.from(panel?.querySelectorAll("a") ?? []).find(
              (anchor) => anchor.textContent === "Note details",
            );
            if (panel && link) {
              start = Number.isNaN(start) ? performance.now() : start;
              const style = getComputedStyle(panel);
              samples.push({
                edge: link.getBoundingClientRect().right,
                opacity: Number.parseFloat(style.opacity),
                scale:
                  style.scale === "none" ? 1 : Number.parseFloat(style.scale),
              });
            }
            // Before the scenario renders, the start time is not set.
            if (Number.isNaN(start) || performance.now() - start < duration) {
              requestAnimationFrame(sample);
            } else {
              resolve(samples);
            }
          };
          sample();
        }),
      FOLD_MS,
    );
    await selectScenario(q, "reveal");
    const samples = await samplesPromise;
    expect(samples.length).toBeGreaterThan(5);
    expect(samples.every((sample) => sample.opacity === 1)).toBe(true);
    expect(samples.every((sample) => sample.scale === 1)).toBe(true);
    expect(getTravel(samples)).toBeLessThan(0.5);
  });

  for (const rtl of [false, true]) {
    const suffix = rtl ? " in right-to-left pages" : "";
    test(`keeps the note on the center of the window when the sidebars open and close${suffix}`, async ({
      page,
      q,
    }) => {
      await selectScenario(q, "reveal");
      if (rtl) {
        await q.checkbox("Right to left").check();
      }
      const note = q.group("Note");
      const shell = getShell(page);
      // The end sidebar is open on the first render.
      await expectCentered(note, shell);
      for (const name of [
        "Start sidebar",
        "End sidebar",
        "Start sidebar",
        "End sidebar",
      ]) {
        await q.checkbox(name).click();
        const largest = await sampleCenterOffset(page, note, shell, FOLD_MS);
        expect(largest).toBeLessThan(1);
        await expectCentered(note, shell);
      }
    });
  }

  test("centers the note on the panel by default", async ({ page, q }) => {
    await selectScenario(q, "reveal");
    await q.checkbox("Center on the shell").uncheck();
    const { width } = await getBox(getSidebar(q, "End sidebar"));
    // The open end sidebar moves the center of the panel by half its width.
    await expect
      .poll(() => getCenterOffset(q.group("Note"), getShell(page)))
      .toBeCloseTo(-width / 2, 0);
  });
});
