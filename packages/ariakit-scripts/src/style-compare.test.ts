import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import {
  hasStyleCompareFailures,
  parseStyleCompareList,
  runStyleCompare,
  splitStyleCompareList,
  styleCompareBrowsers,
  styleCompareStates,
} from "./style-compare.ts";
import type {
  StyleCompareJob,
  StyleCompareOptions,
  StyleCompareReport,
} from "./style-compare.ts";

// Each run launches Chromium and loads every page state in both builds. Install
// it with `pnpm -F @ariakit/scripts exec playwright install chromium`. CI does
// not install browsers for the Test job, so these tests run only locally.
const BROWSER_TIMEOUT = 120_000;

type BuildFiles = Record<string, string>;

interface Fixture {
  baseline: string;
  current: string;
  [Symbol.asyncDispose]: () => Promise<void>;
}

function page(body: string, style = "", head = "") {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <link rel="stylesheet" href="/styles.css">${head}
    <style>${style}</style>
  </head>
  <body>${body}</body>
</html>`;
}

const sharedFiles: BuildFiles = {
  "styles.css": "body { margin: 0; font: 16px/1.5 sans-serif; }",
};

async function writeBuild(root: string, files: BuildFiles) {
  for (const [file, content] of Object.entries({ ...sharedFiles, ...files })) {
    const target = path.join(root, file);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, content);
  }
}

async function createFixture(baseline: BuildFiles, current: BuildFiles) {
  const root = await mkdtemp(path.join(tmpdir(), "style-compare-"));
  const fixture: Fixture = {
    baseline: path.join(root, "baseline"),
    current: path.join(root, "current"),
    [Symbol.asyncDispose]: () => rm(root, { recursive: true, force: true }),
  };
  await writeBuild(fixture.baseline, baseline);
  await writeBuild(fixture.current, current);
  return fixture;
}

function getResults(
  report: StyleCompareReport,
  pagePath: string,
  filter: Partial<StyleCompareJob> = {},
) {
  return report.results.filter((result) => {
    if (result.pagePath !== pagePath) return false;
    if (filter.motion && result.motion !== filter.motion) return false;
    if (filter.state && result.state !== filter.state) return false;
    return true;
  });
}

function getDiff(report: StyleCompareReport, pagePath: string) {
  const [result] = getResults(report, pagePath, {
    motion: "reduce",
    state: "rest",
  });
  if (result?.status !== "diff") {
    throw new Error(`Expected ${pagePath} to differ: ${result?.status}`);
  }
  return result;
}

const sameStyle = `
  .button { color: rgb(0, 0, 0); padding: 4px 8px; }
  .button::after { content: "→"; margin-inline-start: 4px; }
`;

const baselineFiles: BuildFiles = {
  "same/index.html": page(
    `<main><button class="button">Save</button><p>Text</p></main>`,
    sameStyle,
  ),
  "script/index.html": page(`<p class="text">Text</p>`),
  "color/index.html": page(
    `<h1 class="title">Title</h1>`,
    ".title { color: rgb(255, 0, 0); }",
  ),
  "after/index.html": page(
    `<span class="badge">Badge</span>`,
    `.badge::after { content: "new"; }`,
  ),
  "hover/index.html": page(
    `<a class="link" href="#">Link</a>`,
    ".link:is(:hover, .ui-hovered) { color: rgb(0, 0, 255); }",
  ),
  "dom/index.html": page(`<p>One</p>`),
  "motion/index.html": page(
    `<div class="box">Box</div>`,
    `@media (prefers-reduced-motion: no-preference) {
      .box { transition: opacity 150ms; }
    }`,
  ),
  "stylesheet/index.html": page(`<p>Text</p>`),
  "baseline-only/index.html": page(`<p>Only here</p>`),
  // A fragment without a doctype, such as the app partials, is not a page.
  "partials/fragment/index.html": `<section><p>Fragment</p></section>`,
};

const currentFiles: BuildFiles = {
  "same/index.html": page(
    `<main><button class="button">Save</button><p>Text</p></main>`,
    sameStyle,
  ),
  "script/index.html": page(
    `<p class="text">Text</p><script src="/script.js"></script>`,
  ),
  "script.js": `document.querySelector(".text").style.color = "red";`,
  "color/index.html": page(
    `<h1 class="heading">Title</h1>`,
    ".heading { color: rgb(0, 0, 255); }",
  ),
  "after/index.html": page(
    `<span class="badge">Badge</span>`,
    `.badge::after { content: "new"; color: rgb(0, 128, 0); }`,
  ),
  "hover/index.html": page(
    `<a class="link" href="#">Link</a>`,
    ".link:is(:hover, .ui-hovered) { color: rgb(0, 128, 0); }",
  ),
  "dom/index.html": page(`<div>One</div>`),
  "stylesheet/index.html": page(
    `<p>Text</p>`,
    "",
    `<link rel="stylesheet" href="/missing.css">`,
  ),
  "motion/index.html": page(
    `<div class="box">Box</div>`,
    `@media (prefers-reduced-motion: no-preference) {
      .box { transition: opacity 300ms; }
    }`,
  ),
  "partials/fragment/index.html": `<section><p>Fragment</p></section>`,
};

describe.skipIf(!!process.env.CI)("in Chromium", () => {
  let fixture: Fixture | undefined;
  let report: StyleCompareReport;
  const lines: string[] = [];

  beforeAll(async () => {
    fixture = await createFixture(baselineFiles, currentFiles);
    report = await runStyleCompare({
      baseline: fixture.baseline,
      current: fixture.current,
      browsers: ["chromium"],
      states: ["rest", "hover"],
      // More than one worker, so the page states that differ run again alone.
      workers: 2,
      log: (line) => lines.push(line),
    });
  }, BROWSER_TIMEOUT);

  afterAll(async () => {
    await fixture?.[Symbol.asyncDispose]();
  });

  test("reports identical pages as the same", () => {
    const results = getResults(report, "/same/");
    expect(results).toHaveLength(4);
    for (const result of results) {
      expect(result).toMatchObject({ status: "same", rerun: false });
    }
  });

  test("does not run page scripts", () => {
    const results = getResults(report, "/script/");
    expect(results.map((result) => result.status)).toEqual([
      "same",
      "same",
      "same",
      "same",
    ]);
  });

  test("compares elements by DOM position across class names", () => {
    const result = getDiff(report, "/color/");
    expect(result).toMatchObject({ rerun: true, different: 1 });
    expect(result.details).toHaveLength(1);
    expect(result.details[0]).toMatchObject({
      index: 2,
      tag: "h1",
      text: "Title",
      className: "heading",
    });
    expect(result.details[0]?.changes).toContainEqual({
      part: "self",
      property: "color",
      baseline: "rgb(255, 0, 0)",
      current: "rgb(0, 0, 255)",
    });
  });

  test("reports a changed ::after", () => {
    const result = getDiff(report, "/after/");
    const changes = result.details[0]?.changes ?? [];
    expect(changes).toContainEqual({
      part: "::after",
      property: "color",
      baseline: "rgb(0, 0, 0)",
      current: "rgb(0, 128, 0)",
    });
    expect(changes.every((change) => change.part === "::after")).toBe(true);
  });

  test("reports a difference that only applies on hover", () => {
    const statuses = getResults(report, "/hover/").map((result) => [
      result.motion,
      result.state,
      result.status,
    ]);
    expect(statuses).toEqual([
      ["reduce", "rest", "same"],
      ["reduce", "hover", "diff"],
      ["no-preference", "rest", "same"],
      ["no-preference", "hover", "diff"],
    ]);
  });

  test("reports a different DOM as an error", () => {
    const results = getResults(report, "/dom/");
    expect(results).toHaveLength(4);
    for (const result of results) {
      expect(result).toMatchObject({
        status: "error",
        message: "DOM differs at element #2: <p> in baseline, <div> in current",
      });
    }
  });

  test("applies motion-safe rules only without reduced motion", () => {
    const [reduce] = getResults(report, "/motion/", {
      motion: "reduce",
      state: "rest",
    });
    const [noPreference] = getResults(report, "/motion/", {
      motion: "no-preference",
      state: "rest",
    });
    expect(reduce?.status).toBe("same");
    expect(noPreference?.status).toBe("diff");
    if (noPreference?.status !== "diff") return;
    expect(noPreference.details[0]?.changes).toContainEqual({
      part: "self",
      property: "transition-duration",
      baseline: "0.15s",
      current: "0.3s",
    });
  });

  test("reports a stylesheet that does not load as an error", () => {
    const results = getResults(report, "/stylesheet/");
    expect(results).toHaveLength(4);
    for (const result of results) {
      expect(result).toMatchObject({
        status: "error",
        message: "Stylesheets failed to load: /missing.css (404) in current",
      });
    }
  });

  test("throws when no page is in both builds", async () => {
    if (!fixture) throw new Error("The fixture was not created");
    const run = runStyleCompare({
      baseline: fixture.baseline,
      current: fixture.current,
      pages: ["baseline-only", "nothing"],
      log: () => {},
    });
    await expect(run).rejects.toThrow("No page is in both builds");
  });

  test("reports pages that only one build has", () => {
    expect(report.missing).toEqual([
      { pagePath: "/baseline-only/", onlyIn: "baseline" },
    ]);
    expect(report.pages).not.toContain("/baseline-only/");
    expect(report.pages).not.toContain("/partials/fragment/");
    expect(hasStyleCompareFailures(report)).toBe(true);
  });

  test("prints one line for each page state and the different properties", () => {
    const output = lines.join("\n").split("\n");
    expect(output).toContain(
      "same  /same/ [chromium, motion reduce, rest] 5 elements",
    );
    expect(output).toContain(
      "DIFF  /color/ [chromium, motion reduce, rest] 3 elements, 1 different",
    );
    expect(output).toContain(`    #2 <h1> "Title" .heading`);
    // The properties that follow currentColor change with color on one line.
    // Their number depends on the browser version.
    expect(output).toContainEqual(
      expect.stringMatching(
        /^ {8}color, caret-color, .* more\): rgb\(255, 0, 0\) -> rgb\(0, 0, 255\)$/,
      ),
    );
    expect(output).toContain("        transition-duration: 0.15s -> 0.3s");
    expect(output).toContain(
      "ERROR /baseline-only/ is only in the baseline build",
    );
    const statusLines = output.filter((line) =>
      /^(same |DIFF |ERROR) \/(?!baseline-only)/.test(line),
    );
    // 8 pages in both builds, 2 motion preferences, and 2 states.
    expect(statusLines).toHaveLength(32);
  });

  test(
    "matches identical pages in every state",
    async () => {
      const files: BuildFiles = {
        "index.html": page(
          `<main>
            <div role="tablist">
              <button role="tab" aria-selected="true">One</button>
              <button role="tab">Two</button>
            </div>
            <label><input type="checkbox" aria-checked="false"> Check</label>
            <a class="link" href="#">Link</a>
            <button class="button" data-selected="false">Save</button>
          </main>`,
          `${sameStyle}
          .link:is(:hover, .ui-hovered) { color: rgb(0, 0, 255); }
          [data-focus-visible] { outline: 2px solid; }
          [aria-selected="true"] { font-weight: 600; }
          [aria-disabled="true"] { opacity: 0.5; }
          @media (prefers-color-scheme: dark) { body { color: white; } }
          @media (forced-colors: active) { .button { border: 1px solid; } }
          @media (max-width: 600px) { main { padding: 8px; } }
          [dir="rtl"] .button { margin-inline-start: 4px; }`,
        ),
        // More elements than a task holds, so each state is a task of its own.
        "large/index.html": page(
          `<ul>${"<li><a href='#'>Item</a></li>".repeat(550)}</ul>`,
          ".ui-hovered { color: rgb(0, 0, 255); }",
        ),
      };
      await using fixture = await createFixture(files, files);
      const fixtureReport = await runStyleCompare({
        baseline: fixture.baseline,
        current: fixture.current,
        browsers: ["chromium"],
        motions: ["reduce"],
        workers: 2,
        log: () => {},
      });
      const results = fixtureReport.results;
      expect(results).toHaveLength(2 * styleCompareStates.length);
      expect(results.filter((result) => result.status !== "same")).toEqual([]);
    },
    BROWSER_TIMEOUT,
  );

  test(
    "compares scroll-driven animations in states that change many elements",
    async () => {
      // A named timeline shared through an ancestor, as in the carousel styles.
      const markup = `<div class="root">
        <div class="scroller"><div class="row">Row</div></div>
        <div class="fade">Fade</div>
      </div>`;
      const style = (start: number) => `
        @property --fade { syntax: "<number>"; inherits: false; initial-value: 0; }
        .root { timeline-scope: --row; }
        .scroller { overflow-x: auto; width: 200px; scroll-timeline: --row x; }
        .row { width: 800px; }
        .fade {
          opacity: calc(0.5 + var(--fade) / 2);
          animation-name: fade;
          animation-timing-function: linear;
          animation-fill-mode: both;
          animation-timeline: --row;
        }
        @keyframes fade { from { --fade: ${start}; } to { --fade: 1; } }`;
      await using fixture = await createFixture(
        { "index.html": page(markup, style(0)) },
        { "index.html": page(markup, style(0.2)) },
      );
      const fixtureReport = await runStyleCompare({
        baseline: fixture.baseline,
        current: fixture.current,
        // Without the wait for the new timeline of the reattached body,
        // Chromium reads the base opacity in both builds.
        browsers: ["chromium"],
        motions: ["reduce"],
        // The hover state changes every element, which reattaches the body
        // right after the load.
        states: ["hover"],
        workers: 1,
        log: () => {},
      });
      const statuses = fixtureReport.results.map((result) => result.status);
      expect(statuses).toEqual(["diff"]);
    },
    BROWSER_TIMEOUT,
  );

  test(
    "applies the media of the narrow, dark, and forced states",
    async () => {
      const markup = `<p class="narrow">Narrow</p>
        <p class="dark">Dark</p>
        <p class="forced">Forced</p>`;
      // Border widths, because forced colors replace the colors.
      const rules = (width: string) => `
        @media (max-width: 600px) { .narrow { border: ${width} solid; } }
        @media (prefers-color-scheme: dark) { .dark { border: ${width} solid; } }
        @media (forced-colors: active) { .forced { border: ${width} solid; } }`;
      await using fixture = await createFixture(
        { "index.html": page(markup, rules("1px")) },
        { "index.html": page(markup, rules("2px")) },
      );
      const fixtureReport = await runStyleCompare({
        baseline: fixture.baseline,
        current: fixture.current,
        browsers: ["chromium"],
        // Each media state has a load of its own on the same reused page, so
        // the media of one load must not stay in the next one. Inside a load,
        // the motion switch must keep the media of the load.
        states: ["rest", "dark", "narrow", "forced"],
        workers: 1,
        log: () => {},
      });
      // The border also changes the height of the html and body elements, which
      // have no class.
      const differences = fixtureReport.results.map((result) => [
        result.motion,
        result.state,
        result.status === "diff"
          ? result.details.map((detail) => detail.className).filter(Boolean)
          : result.status,
      ]);
      expect(differences).toEqual([
        ["reduce", "rest", "same"],
        ["reduce", "narrow", ["narrow"]],
        ["reduce", "dark", ["dark"]],
        ["reduce", "forced", ["forced"]],
        ["no-preference", "rest", "same"],
        ["no-preference", "narrow", ["narrow"]],
        ["no-preference", "dark", ["dark"]],
        ["no-preference", "forced", ["forced"]],
      ]);
    },
    BROWSER_TIMEOUT,
  );

  test(
    "reports many differences without running them again alone",
    async () => {
      // 3 pages in 9 states and 2 motion preferences are 54 page states, more
      // than the 50 that can run again alone.
      const files = (margin: string) =>
        Object.fromEntries(
          ["one", "two", "three"].map((name) => [
            `${name}/index.html`,
            page(`<p>Text</p>`, `body { margin-top: ${margin}; }`),
          ]),
        );
      await using fixture = await createFixture(files("1px"), files("2px"));
      const output: string[] = [];
      const fixtureReport = await runStyleCompare({
        baseline: fixture.baseline,
        current: fixture.current,
        browsers: ["chromium"],
        workers: 2,
        log: (line) => output.push(line),
      });
      const results = fixtureReport.results;
      expect(results).toHaveLength(54);
      expect(results.every((result) => result.status === "diff")).toBe(true);
      expect(results.some((result) => result.rerun)).toBe(false);
      expect(output).toContain(
        "chromium: 54 page states do not match, more than 50, so they do not run again alone",
      );
      const diffLines = output.filter((line) => line.startsWith("DIFF  "));
      expect(diffLines).toHaveLength(54);
    },
    BROWSER_TIMEOUT,
  );

  test(
    "reports a stylesheet that fails without a response as an error",
    async () => {
      // Requests to other hosts are blocked, so this stylesheet never loads.
      const external = `<link rel="stylesheet" href="https://example.invalid/theme.css">`;
      await using fixture = await createFixture(
        { "index.html": page(`<p>Text</p>`) },
        { "index.html": page(`<p>Text</p>`, "", external) },
      );
      const fixtureReport = await runStyleCompare({
        baseline: fixture.baseline,
        current: fixture.current,
        browsers: ["chromium"],
        motions: ["reduce"],
        states: ["rest"],
        workers: 1,
        log: () => {},
      });
      const [result] = fixtureReport.results;
      expect(result?.status).toBe("error");
      if (result?.status !== "error") return;
      expect(result.message).toMatch(
        /^Stylesheets failed to load: https:\/\/example\.invalid\/theme\.css \(.+\) in current$/,
      );
    },
    BROWSER_TIMEOUT,
  );

  test(
    "ignores stylesheets that fail in an iframe",
    async () => {
      // The framed page is a page of its own, and reports its stylesheet.
      const files = {
        "index.html": page(`<iframe src="/frame/"></iframe>`),
        "frame/index.html": page(
          `<p>Frame</p>`,
          "",
          `<link rel="stylesheet" href="/missing.css">`,
        ),
      };
      await using fixture = await createFixture(files, files);
      const fixtureReport = await runStyleCompare({
        baseline: fixture.baseline,
        current: fixture.current,
        browsers: ["chromium"],
        motions: ["reduce"],
        states: ["rest"],
        workers: 1,
        log: () => {},
      });
      const [main] = getResults(fixtureReport, "/");
      const [frame] = getResults(fixtureReport, "/frame/");
      expect(main?.status).toBe("same");
      expect(frame).toMatchObject({
        status: "error",
        message:
          "Stylesheets failed to load: /missing.css (404) in baseline, /missing.css (404) in current",
      });
    },
    BROWSER_TIMEOUT,
  );

  test(
    "compares url() values without the origin of each build",
    async () => {
      const image = (path: string) =>
        page(
          `<p class="image">Image</p>`,
          `.image { background-image: url("${path}"); }`,
        );
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"></svg>`;
      await using fixture = await createFixture(
        {
          "same/index.html": image("/a.svg"),
          "moved/index.html": image("/a.svg"),
          "a.svg": svg,
        },
        {
          "same/index.html": image("/a.svg"),
          "moved/index.html": image("/b.svg"),
          "b.svg": svg,
          "a.svg": svg,
        },
      );
      const output: string[] = [];
      const fixtureReport = await runStyleCompare({
        baseline: fixture.baseline,
        current: fixture.current,
        browsers: ["chromium"],
        motions: ["reduce"],
        states: ["rest"],
        workers: 1,
        log: (line) => output.push(line),
      });
      const statuses = fixtureReport.results.map((result) => [
        result.pagePath,
        result.status,
      ]);
      expect(statuses).toEqual([
        ["/moved/", "diff"],
        ["/same/", "same"],
      ]);
      expect(output.join("\n")).toContain(
        `background-image: url("/a.svg") -> url("/b.svg")`,
      );
    },
    BROWSER_TIMEOUT,
  );

  test(
    "reports elements with a different parent as a DOM difference",
    async () => {
      // The same tags in the same order, with a different nesting.
      await using fixture = await createFixture(
        { "index.html": page(`<div><span>A</span></div><div>B</div>`) },
        { "index.html": page(`<div></div><span>A</span><div>B</div>`) },
      );
      const fixtureReport = await runStyleCompare({
        baseline: fixture.baseline,
        current: fixture.current,
        browsers: ["chromium"],
        motions: ["reduce"],
        states: ["rest"],
        workers: 1,
        log: () => {},
      });
      expect(fixtureReport.results[0]).toMatchObject({
        status: "error",
        message:
          "DOM differs at element #3: <span> is in #2 in baseline, #1 in current",
      });
    },
    BROWSER_TIMEOUT,
  );

  test(
    "forces native hover and focus rules",
    async () => {
      const markup = `<a class="link" href="#">Link</a>
        <a class="md:hover:x" href="#">Stacked</a>
        <a class="nest" href="#">Nested</a>
        <button class="quoted" data-state=":hover">Quoted</button>
        <input class="field" aria-label="Field">
        <button class="plain">Plain</button>
        <button class="imported">Imported</button>`;
      // Rules that read only the native pseudo-classes, as Tailwind variants
      // do, including a stacked variant, a nested rule, an attribute value with
      // a pseudo-class in it, and an imported sheet.
      const rules = (width: string) => `
        @import url("/imported.css");
        @media (hover: hover) { .link:hover { border: ${width} solid; } }
        .md\\:hover\\:x:hover { border: ${width} solid; }
        .nest { &:hover { border: ${width} solid; } }
        .quoted[data-state=":hover"]:hover { border: ${width} solid; }
        .field:focus-visible { border: ${width} solid; }
        .plain:focus { border: ${width} solid; }`;
      const imported = (width: string) =>
        `.imported:focus { border: ${width} solid; }`;
      await using fixture = await createFixture(
        {
          "index.html": page(markup, rules("1px")),
          "imported.css": imported("1px"),
        },
        {
          "index.html": page(markup, rules("2px")),
          "imported.css": imported("2px"),
        },
      );
      const fixtureReport = await runStyleCompare({
        baseline: fixture.baseline,
        current: fixture.current,
        browsers: ["chromium"],
        motions: ["reduce"],
        states: ["rest", "hover", "focus"],
        workers: 1,
        log: () => {},
      });
      // The border also changes the height of the html and body elements, which
      // have no class.
      const differences = fixtureReport.results.map((result) => [
        result.state,
        result.status === "diff"
          ? result.details.map((detail) => detail.className).filter(Boolean)
          : result.status,
      ]);
      expect(differences).toEqual([
        ["rest", "same"],
        [
          "hover",
          [
            "link ui-hovered",
            "md:hover:x ui-hovered",
            "nest ui-hovered",
            "quoted ui-hovered",
          ],
        ],
        ["focus", ["field", "plain", "imported"]],
      ]);
    },
    BROWSER_TIMEOUT,
  );

  test(
    "forces native checked and disabled states",
    async () => {
      const markup = `<input type="checkbox" class="check" aria-label="Check">
        <input type="radio" name="group" class="first" aria-label="First" checked>
        <input type="radio" name="group" class="second" aria-label="Second">
        <button class="button">Button</button>
        <select class="select" aria-label="Select"><option>One</option></select>
        <div class="custom" role="checkbox" aria-checked="false">Custom</div>`;
      // Rules that read only the native states, as Tailwind variants do.
      const rules = (width: string) => `
        .check:checked, .first:not(:checked) { outline: ${width} solid; }
        .button:disabled, .select:disabled { outline: ${width} solid; }`;
      await using fixture = await createFixture(
        { "index.html": page(markup, rules("1px")) },
        { "index.html": page(markup, rules("2px")) },
      );
      const fixtureReport = await runStyleCompare({
        baseline: fixture.baseline,
        current: fixture.current,
        browsers: ["chromium"],
        motions: ["reduce"],
        states: ["rest", "selected", "disabled"],
        workers: 1,
        log: () => {},
      });
      const differences = fixtureReport.results.map((result) => [
        result.state,
        result.status === "diff"
          ? result.details.map((detail) => detail.className)
          : result.status,
      ]);
      expect(differences).toEqual([
        ["rest", "same"],
        ["selected", ["check", "first"]],
        ["disabled", ["button", "select"]],
      ]);
    },
    BROWSER_TIMEOUT,
  );

  test(
    "restores each state before the next one on the same load",
    async () => {
      // The box has the hover marker in its markup, so a hover selector that
      // stays rewritten would also match it in the rest state. The last radio
      // starts checked, and the selected state checks the others first.
      const markup = `<p>Text</p>
        <div role="tab" aria-selected="false">Tab</div>
        <button>Button</button>
        <div class="box ui-hovered">Box</div>
        <input type="checkbox" class="check" aria-label="Check">
        <input type="radio" name="group" aria-label="First">
        <input type="radio" name="group" aria-label="Second">
        <input type="radio" name="group" class="last" aria-label="Last" checked>`;
      const rules = (color: string) => `
        p[class], [aria-selected="true"], [aria-disabled="true"],
        [data-focus-visible], [dir="rtl"] body, .box:hover, :disabled,
        .check:checked, .last:not(:checked) { color: ${color}; }`;
      await using fixture = await createFixture(
        { "index.html": page(markup, rules("rgb(255, 0, 0)")) },
        { "index.html": page(markup, rules("rgb(0, 0, 255)")) },
      );
      const fixtureReport = await runStyleCompare({
        baseline: fixture.baseline,
        current: fixture.current,
        browsers: ["chromium"],
        motions: ["reduce"],
        // One load serves the states in this order. Without the restore, the
        // rest state at the end would keep the attributes of the others.
        states: ["hover", "focus", "selected", "disabled", "rtl", "rest"],
        workers: 1,
        log: () => {},
      });
      const statuses = fixtureReport.results.map((result) => [
        result.state,
        result.status,
      ]);
      expect(statuses).toEqual([
        ["rest", "same"],
        ["hover", "diff"],
        ["focus", "diff"],
        ["selected", "diff"],
        ["disabled", "diff"],
        ["rtl", "diff"],
      ]);
    },
    BROWSER_TIMEOUT,
  );

  test(
    "skips ignored properties",
    async () => {
      await using fixture = await createFixture(
        {
          "index.html": page(
            `<p class="text">Text</p>`,
            `.text { --tw-content: "a"; }`,
          ),
        },
        {
          "index.html": page(
            `<p class="text">Text</p>`,
            `.text { --tw-content: "b"; }`,
          ),
        },
      );
      const options: StyleCompareOptions = {
        baseline: fixture.baseline,
        current: fixture.current,
        browsers: ["chromium"],
        motions: ["reduce"],
        states: ["rest"],
        workers: 1,
        log: () => {},
      };
      const strict = await runStyleCompare(options);
      const ignored = await runStyleCompare({
        ...options,
        ignoreProperties: ["--tw-*"],
      });
      expect(strict.results.map((result) => result.status)).toEqual(["diff"]);
      expect(ignored.results.map((result) => result.status)).toEqual(["same"]);
    },
    BROWSER_TIMEOUT,
  );
});

test("parses comma-separated names", () => {
  expect(splitStyleCompareList(" --tw-*, ,--_ak-*,--tw-*, ")).toEqual([
    "--tw-*",
    "--_ak-*",
  ]);
  expect(
    parseStyleCompareList("webkit, chromium", styleCompareBrowsers),
  ).toEqual(["webkit", "chromium"]);
  expect(parseStyleCompareList("rest,", styleCompareStates)).toEqual(["rest"]);
  expect(() => parseStyleCompareList("chrome", styleCompareBrowsers)).toThrow(
    "Unknown value chrome. Use chromium, webkit.",
  );
});
