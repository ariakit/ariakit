// Compares the computed styles of every element, and of its ::before and
// ::after, between two production builds of the same pages. Use it to prove
// that a CSS refactor does not change what the pages render.
//
// Build each side as the app workflow does, and save a copy of
// `app/dist/client`:
//
//   CLOUDFLARE_ENV=preview pnpm -F app run build
//
// Then run:
//
//   pnpm style-compare --baseline <folder> --current <folder> [pages...]
//
// Elements match by DOM position, so class names can differ between builds.
// The DOM must be the same. Playwright runs the browsers. Install them with:
//
//   pnpm -F @ariakit/scripts exec playwright install chromium webkit
import { createReadStream } from "node:fs";
import { readdir, readFile, stat } from "node:fs/promises";
import { createServer } from "node:http";
import type { IncomingMessage, Server, ServerResponse } from "node:http";
import { availableParallelism } from "node:os";
import path from "node:path";
import { chromium, webkit } from "@playwright/test";
import type { Browser, Page, Request } from "@playwright/test";

export const styleCompareBrowsers = ["chromium", "webkit"] as const;

/** Values of the `prefers-reduced-motion` media feature. */
export const styleCompareMotions = ["reduce", "no-preference"] as const;

/**
 * States that the comparison forces on every element at once:
 * - `hover`: the `ui-hovered` class, and native `:hover` rules also match it.
 * - `focus`: the `data-focus-visible` attribute, and native `:focus`,
 *   `:focus-visible`, and `:focus-within` rules also match it.
 * - `selected`: flips `aria-selected`, `aria-checked`, and `data-selected`,
 *   selects tabs, toggles native checkboxes, and checks one radio in each
 *   group, the last one that was not checked.
 * - `disabled`: `aria-disabled` on buttons, links, inputs, tabs, and
 *   `role=button` elements, and the `disabled` attribute on buttons, inputs,
 *   selects, and text areas.
 * - `narrow`, `dark`, `forced`, and `rtl`: the viewport, the color scheme,
 *   forced colors, and the `dir` attribute of the root.
 *
 * Other states are not forced, such as `:active`, `:indeterminate`, `:open`,
 * `:placeholder-shown`, validity, `aria-expanded`, `aria-pressed`, and styles
 * in shadow roots.
 */
export const styleCompareStates = [
  "rest",
  "narrow",
  "hover",
  "focus",
  "selected",
  "disabled",
  "dark",
  "forced",
  "rtl",
] as const;

export type StyleCompareBrowser = (typeof styleCompareBrowsers)[number];
export type StyleCompareMotion = (typeof styleCompareMotions)[number];
export type StyleCompareState = (typeof styleCompareStates)[number];
export type StylePart = "self" | "::before" | "::after";

export interface StyleCompareOptions {
  /** Folder of the baseline build, such as a saved `app/dist/client`. */
  baseline: string;
  /** Folder of the current build. */
  current: string;
  /**
   * Page path prefixes to compare, such as `react/previews/app-shell`. A prefix
   * matches the page at that path and the pages below it. Default: all pages.
   */
  pages?: readonly string[];
  /** Default: all browsers. */
  browsers?: readonly StyleCompareBrowser[];
  /** Default: all motion preferences. */
  motions?: readonly StyleCompareMotion[];
  /** Default: all states. */
  states?: readonly StyleCompareState[];
  /** Number of pages that load at the same time in each build. */
  workers?: number;
  /** Maximum number of elements to detail for each different page state. */
  details?: number;
  /**
   * Computed properties to skip, such as `--tw-content`. A trailing `*` matches
   * a prefix, such as `--tw-*`.
   */
  ignoreProperties?: readonly string[];
  /** Receives each output line. Default: `console.log`. */
  log?: (line: string) => void;
}

export interface StyleCompareJob {
  /** URL path of the page, such as `/react/previews/app-shell/`. */
  pagePath: string;
  browser: StyleCompareBrowser;
  motion: StyleCompareMotion;
  state: StyleCompareState;
}

export interface StyleChange {
  part: StylePart;
  property: string;
  baseline?: string;
  current?: string;
}

export interface ElementDifference {
  /** Position of the element in document order, from `html`. */
  index: number;
  tag: string;
  text: string;
  /** Class attribute of the element in the current build. */
  className: string;
  changes: StyleChange[];
}

interface ChangeGroup {
  part: StylePart;
  properties: string[];
  baseline?: string;
  current?: string;
}

interface PageStateResultBase extends StyleCompareJob {
  /**
   * Whether the page state did not match in the parallel pass, and this result
   * comes from running it again alone.
   */
  rerun: boolean;
}

export interface SamePageStateResult extends PageStateResultBase {
  status: "same";
  elements: number;
}

export interface DiffPageStateResult extends PageStateResultBase {
  status: "diff";
  elements: number;
  /** Number of elements with different styles. */
  different: number;
  /** The first different elements, up to the `details` option. */
  details: ElementDifference[];
}

export interface ErrorPageStateResult extends PageStateResultBase {
  status: "error";
  message: string;
}

export type PageStateResult =
  | SamePageStateResult
  | DiffPageStateResult
  | ErrorPageStateResult;

export interface MissingPage {
  pagePath: string;
  /** The build that has the page. */
  onlyIn: "baseline" | "current";
}

export interface StyleCompareReport {
  /** URL paths of the pages that both builds have. */
  pages: string[];
  missing: MissingPage[];
  results: PageStateResult[];
}

type StyleEntries = Array<[property: string, value: string]>;

interface ElementStyles {
  tag: string;
  text: string;
  className: string;
  self: StyleEntries;
  before: StyleEntries | null;
  after: StyleEntries | null;
}

interface CollectedPage {
  tags: string[];
  /** Position of the parent of each element, or -1 for the root. */
  parents: number[];
  digests: string[];
}

interface StyleCompareInspector {
  elements: Element[];
  readStyle: (element: Element, pseudo: StylePart) => StyleEntries | null;
}

/** An attribute and its value before applyState changed it. */
type AttributeChange = [element: Element, name: string, value: string | null];

/** A native checkbox or radio and its checked state before applyState. */
type CheckedChange = [input: HTMLInputElement, checked: boolean];

/** A style rule and its selector before applyState changed it. */
type SelectorChange = [rule: CSSStyleRule, selector: string];

interface StyleCompareWindow extends Window {
  ariakitStyleCompareElements?: Element[];
  ariakitStyleCompareChanges?: AttributeChange[];
  ariakitStyleCompareReattached?: boolean;
  ariakitStyleCompareSelectors?: SelectorChange[];
  ariakitStyleCompareChecked?: CheckedChange[];
  ariakitStyleCompare?: StyleCompareInspector;
}

interface CompareSettings {
  baselineOrigin: string;
  currentOrigin: string;
  details: number;
  ignoreProperties: readonly string[];
}

interface StatePair {
  state: StyleCompareState;
  motion: StyleCompareMotion;
}

/** The page states that one load of a page serves, in order. */
type PageLoad = StatePair[];

/** One page, compared in each of its states and motion preferences. */
interface PageTask {
  pagePath: string;
  browser: StyleCompareBrowser;
  loads: PageLoad[];
  /** Estimated work, so the largest tasks start first. */
  size: number;
}

interface PageMedia {
  narrow: boolean;
  colorScheme: "light" | "dark";
  forcedColors: "active" | "none";
  reducedMotion: StyleCompareMotion;
}

interface BuildPage {
  page: Page;
  origin: string;
  /** Stylesheets that failed in the last load, with the reason. */
  failedStylesheets: Map<string, string>;
}

interface WorkerPages {
  baseline: BuildPage;
  current: BuildPage;
}

interface RunTasksParams {
  browser: StyleCompareBrowser;
  tasks: PageTask[];
  workers: number;
  settings: CompareSettings;
  rerun: boolean;
  onResult?: (result: PageStateResult) => void;
}

interface CompareTaskParams {
  pages: WorkerPages;
  task: PageTask;
  settings: CompareSettings;
  rerun: boolean;
}

interface CompareMotionParams {
  pages: WorkerPages;
  job: StyleCompareJob;
  settings: CompareSettings;
  rerun: boolean;
}

const DEFAULT_DETAILS = 12;
// Page states that fail, such as after a browser crash or a timeout, run again
// up to this number of attempts.
const MAX_ATTEMPTS = 3;
const NAVIGATION_TIMEOUT = 30_000;
const WIDE_VIEWPORT = { width: 1280, height: 900 };
const NARROW_VIEWPORT = { width: 420, height: 800 };
// Pages with more elements than this split into one task for each state, so
// that they do not hold up the end of the run.
const LARGE_PAGE_ELEMENTS = 1000;
// Timing noise changed a few page states at most. When more differ, a pass with
// one worker would delay the report for long, so it uses the parallel results.
const MAX_ALONE_RERUNS = 50;
// States that only change the DOM. One load serves all of them, because
// restoreState undoes each one. The other states change the viewport or the
// media, so each one has a load of its own.
const domStates = new Set<StyleCompareState>([
  "rest",
  "hover",
  "focus",
  "selected",
  "disabled",
  "rtl",
]);
const MAX_CHANGE_LINES = 6;
const MAX_PROPERTY_NAMES = 3;
const MAX_VALUE_LENGTH = 60;
const MAX_CLASSES = 4;

const contentTypes = new Map([
  [".avif", "image/avif"],
  [".css", "text/css; charset=utf-8"],
  [".gif", "image/gif"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".jpeg", "image/jpeg"],
  [".jpg", "image/jpeg"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".txt", "text/plain; charset=utf-8"],
  [".webp", "image/webp"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"],
]);

/**
 * Splits a comma-separated list of names, without empty or repeated names.
 */
export function splitStyleCompareList(value: string) {
  const names = value.split(",").map((name) => name.trim());
  return [...new Set(names.filter(Boolean))];
}

/**
 * Parses a comma-separated list of names and throws on names that `allowed`
 * does not include.
 */
export function parseStyleCompareList<T extends string>(
  value: string,
  allowed: readonly T[],
) {
  const names = splitStyleCompareList(value);
  const isAllowed = (name: string): name is T =>
    allowed.some((allowedName) => allowedName === name);
  const unknown = names.filter((name) => !isAllowed(name));
  if (unknown.length) {
    throw new Error(
      `Unknown value ${unknown.join(", ")}. Use ${allowed.join(", ")}.`,
    );
  }
  return names.filter(isAllowed);
}

function getDefaultWorkers() {
  return Math.max(1, Math.round(availableParallelism() * 0.75));
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message.split("\n")[0] ?? "";
  return String(error);
}

function trimSlashes(value: string) {
  return value.replace(/^\/+|\/+$/g, "");
}

function toPagePath(directory: string) {
  const trimmed = trimSlashes(directory.split(path.sep).join("/"));
  return trimmed ? `/${trimmed}/` : "/";
}

function matchesPrefix(pagePath: string, prefix: string) {
  const page = trimSlashes(pagePath);
  const normalizedPrefix = trimSlashes(prefix);
  if (!normalizedPrefix) return true;
  if (page === normalizedPrefix) return true;
  return page.startsWith(`${normalizedPrefix}/`);
}

/**
 * Finds the pages in a build folder, with an estimate of their number of
 * elements. Fragments without a doctype, such as the app's `partials` folder,
 * are not pages.
 */
async function findPages(root: string) {
  const entries = await readdir(root, { recursive: true, withFileTypes: true });
  const pages = new Map<string, number>();
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    if (entry.name !== "index.html") continue;
    const html = await readFile(
      path.join(entry.parentPath, entry.name),
      "utf8",
    );
    if (!/^\s*<!doctype html/i.test(html)) continue;
    const pagePath = toPagePath(path.relative(root, entry.parentPath));
    // Each start tag opens an element. Code samples escape their tags.
    pages.set(pagePath, html.match(/<[a-z]/gi)?.length ?? 0);
  }
  return pages;
}

async function resolveRequestFile(root: string, url: string) {
  const { pathname } = new URL(url, "http://localhost");
  const file = path.join(root, decodeURIComponent(pathname));
  // Requests cannot read files outside the build folder.
  if (file !== root && !file.startsWith(`${root}${path.sep}`)) return;
  const stats = await stat(file);
  if (stats.isFile()) return file;
  const index = path.join(file, "index.html");
  const indexStats = await stat(index);
  if (indexStats.isFile()) return index;
  return;
}

function createStaticServer(root: string) {
  const handle = async (request: IncomingMessage, response: ServerResponse) => {
    const file = await resolveRequestFile(root, request.url ?? "/").catch(
      () => undefined,
    );
    if (!file) {
      response.writeHead(404).end();
      return;
    }
    const contentType = contentTypes.get(path.extname(file));
    response.writeHead(200, {
      "content-type": contentType ?? "application/octet-stream",
    });
    createReadStream(file)
      .on("error", () => response.destroy())
      .pipe(response);
  };
  return createServer((request, response) => {
    void handle(request, response);
  });
}

async function listen(server: Server) {
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("The build server has no port");
  }
  return `http://127.0.0.1:${address.port}`;
}

function launchBrowser(browser: StyleCompareBrowser) {
  if (browser === "webkit") return webkit.launch();
  // The full Chromium build in new headless mode, as in the app browser tests.
  return chromium.launch({ channel: "chromium" });
}

/**
 * Opens a page for one build. Page scripts do not run, so hydration timing
 * cannot change the result, and pages cannot reach other hosts. Inline scripts
 * still run.
 */
async function openBuildPage(browser: Browser, origin: string) {
  const context = await browser.newContext();
  await context.route("**/*", (route) => {
    const request = route.request();
    if (new URL(request.url()).origin !== origin) return route.abort();
    if (request.resourceType() === "script") return route.abort();
    return route.continue();
  });
  const page = await context.newPage();
  const failedStylesheets = new Map<string, string>();
  const buildPage: BuildPage = { page, origin, failedStylesheets };
  // Without its styles, a page would match an unstyled page in the other build,
  // such as when the build folder is wrong. Stylesheets from other hosts fail
  // too, because the route above blocks them. The browsers report a stylesheet
  // with an error status as a failed request too, so only the first reason
  // counts. Only the main document counts, because the comparison does not read
  // iframes, and the browsers abort stylesheets of lazy preview iframes.
  const addFailure = (request: Request, reason: string) => {
    if (request.resourceType() !== "stylesheet") return;
    if (request.frame() !== page.mainFrame()) return;
    const parsed = new URL(request.url());
    const file = parsed.origin === origin ? parsed.pathname : parsed.href;
    if (failedStylesheets.has(file)) return;
    failedStylesheets.set(file, reason);
  };
  page.on("response", (response) => {
    if (response.status() < 400) return;
    addFailure(response.request(), String(response.status()));
  });
  page.on("requestfailed", (request) => {
    addFailure(request, request.failure()?.errorText ?? "failed");
  });
  return buildPage;
}

/**
 * Holds the browser and the two build pages of a worker. Tasks reuse the pages,
 * because a new context for each load takes longer than the load itself. After
 * a reset, such as after an error, the next task starts a new browser.
 */
function createWorkerSession(
  name: StyleCompareBrowser,
  settings: CompareSettings,
) {
  let browser: Browser | undefined;
  let pages: WorkerPages | undefined;
  const reset = async () => {
    const previous = browser;
    browser = undefined;
    pages = undefined;
    // A browser that crashed can fail to close.
    await previous?.close().catch(() => {});
  };
  return {
    async get() {
      if (pages && browser?.isConnected()) return pages;
      await reset();
      browser = await launchBrowser(name);
      pages = {
        baseline: await openBuildPage(browser, settings.baselineOrigin),
        current: await openBuildPage(browser, settings.currentOrigin),
      };
      return pages;
    },
    reset,
    [Symbol.asyncDispose]: reset,
  };
}

function getMedia(state: StyleCompareState, motion: StyleCompareMotion) {
  const media: PageMedia = {
    narrow: state === "narrow",
    colorScheme: state === "dark" ? "dark" : "light",
    // WebKit matches the forced-colors media query, but it does not replace the
    // colors as Chromium does.
    forcedColors: state === "forced" ? "active" : "none",
    reducedMotion: motion,
  };
  return media;
}

async function loadPage(
  buildPage: BuildPage,
  pagePath: string,
  media: PageMedia,
) {
  const { page } = buildPage;
  // The page is reused, so each load sets every emulated feature again.
  await page.setViewportSize(media.narrow ? NARROW_VIEWPORT : WIDE_VIEWPORT);
  await page.emulateMedia({
    colorScheme: media.colorScheme,
    forcedColors: media.forcedColors,
    reducedMotion: media.reducedMotion,
  });
  buildPage.failedStylesheets.clear();
  await buildPage.page.goto(new URL(pagePath, buildPage.origin).href, {
    waitUntil: "load",
    timeout: NAVIGATION_TIMEOUT,
  });
}

/**
 * Runs in the page. Forces the state on every element, and keeps the elements
 * for collectStyles and the changes for restoreState.
 */
async function applyState(state: StyleCompareState) {
  const skippedTags = ["script", "style", "template", "link", "meta"];
  const elements = Array.from(
    document.querySelectorAll("html, body, body *"),
  ).filter((element) => !skippedTags.includes(element.localName));
  const changes: AttributeChange[] = [];
  const checkedChanges: CheckedChange[] = [];
  const fields: Element[] = [];

  const setAttribute = (element: Element, name: string, value: string) => {
    changes.push([element, name, element.getAttribute(name)]);
    element.setAttribute(name, value);
  };

  const flip = (element: Element, name: string) => {
    const value = element.getAttribute(name);
    if (value === "true") {
      setAttribute(element, name, "false");
    } else if (value === "false") {
      setAttribute(element, name, "true");
    }
  };

  // With the app styles, each attribute change of a connected element is slow
  // in WebKit: more than 45 s for the 3,001 buttons of a perf page. A detached
  // body restyles once, when it goes back. The other states change no
  // attribute, or only the one of the root element.
  const target: StyleCompareWindow = window;
  const { body } = document;
  const bodyNext = body.nextSibling;
  const detach = ["hover", "focus", "selected", "disabled"].includes(state);
  if (detach) {
    body.remove();
    target.ariakitStyleCompareReattached = true;
  }
  // Real :hover and :focus-visible match only one element chain at a time. The
  // Ariakit UI styles also read these markers, so every element can show the
  // state at once.
  for (const element of elements) {
    if (state === "hover") {
      changes.push([element, "class", element.getAttribute("class")]);
      element.classList.add("ui-hovered");
    } else if (state === "focus") {
      setAttribute(element, "data-focus-visible", "");
    } else if (state === "selected") {
      flip(element, "aria-selected");
      flip(element, "aria-checked");
      flip(element, "data-selected");
      if (
        element.getAttribute("role") === "tab" &&
        !element.hasAttribute("aria-selected")
      ) {
        setAttribute(element, "aria-selected", "true");
      }
      const checkable =
        element instanceof HTMLInputElement &&
        (element.type === "checkbox" || element.type === "radio");
      if (checkable) {
        checkedChanges.push([element, element.checked]);
      }
    } else if (state === "disabled") {
      if (element.matches("button, a, input, [role=tab], [role=button]")) {
        setAttribute(element, "aria-disabled", "true");
      }
      if (element.localName === "button") {
        setAttribute(element, "disabled", "");
      } else if (element.matches("input, select, textarea")) {
        fields.push(element);
      }
    }
  }
  // Native :checked reads the checked property, not an attribute. All states
  // are saved before this flip, because checking a radio unchecks the others in
  // its group.
  for (const [input, checked] of checkedChanges) {
    input.checked = !checked;
  }
  if (detach) {
    document.documentElement.insertBefore(body, bodyNext);
  }
  // In WebKit, a text field that becomes disabled on a detached body, or in the
  // frame that the body goes back, keeps a narrower width than a disabled field
  // on the page. Pages have few fields, so they change on the page, two frames
  // later.
  if (fields.length) {
    const frame = () =>
      new Promise((resolve) => requestAnimationFrame(resolve));
    await frame();
    await frame();
    for (const field of fields) {
      setAttribute(field, "disabled", "");
    }
  }
  if (state === "rtl") {
    setAttribute(document.documentElement, "dir", "rtl");
  }

  // Native rules, such as the hover: utilities of the app, do not read the
  // markers. In these states, their pseudo-classes also match the markers, with
  // the same specificity. Escapes, such as in .md\:hover\:underline, and quoted
  // strings, such as attribute values, match first and stay as they are.
  const pseudoClass =
    state === "hover"
      ? { name: String.raw`:hover(?![\w-])`, marker: ".ui-hovered" }
      : state === "focus"
        ? {
            name: String.raw`:focus(?:-visible|-within)?(?![\w-])`,
            marker: "[data-focus-visible]",
          }
        : undefined;
  const kept = String.raw`\\[\s\S]|"(?:[^"\\]|\\[\s\S])*"|'(?:[^'\\]|\\[\s\S])*'`;
  const replacement = pseudoClass && {
    pattern: new RegExp(`${kept}|${pseudoClass.name}`, "g"),
    replace: (match: string) =>
      match.startsWith(":") ? `:is(${match}, ${pseudoClass.marker})` : match,
  };
  const selectorChanges: SelectorChange[] = [];
  const rewrite = (rules: CSSRuleList) => {
    if (!replacement) return;
    for (const rule of Array.from(rules)) {
      if (rule instanceof CSSImportRule) {
        if (rule.styleSheet) {
          rewrite(rule.styleSheet.cssRules);
        }
        continue;
      }
      if (rule instanceof CSSStyleRule) {
        const selector = rule.selectorText;
        const next = selector.replace(replacement.pattern, replacement.replace);
        if (next !== selector) {
          selectorChanges.push([rule, selector]);
          rule.selectorText = next;
        }
      }
      // Nested style rules, and media, supports, layer, and container rules.
      if (rule instanceof CSSStyleRule || rule instanceof CSSGroupingRule) {
        rewrite(rule.cssRules);
      }
    }
  };
  for (const sheet of Array.from(document.styleSheets)) {
    rewrite(sheet.cssRules);
  }

  target.ariakitStyleCompareElements = elements;
  target.ariakitStyleCompareChanges = changes;
  target.ariakitStyleCompareSelectors = selectorChanges;
  target.ariakitStyleCompareChecked = checkedChanges;
}

/**
 * Runs in the page. Restores the attributes, checked states, and selectors that
 * applyState changed, so the next state starts from the loaded page.
 */
function restoreState() {
  const target: StyleCompareWindow = window;
  const changes = target.ariakitStyleCompareChanges ?? [];
  // A detached body restyles once, as in applyState.
  const { body } = document;
  const bodyNext = body.nextSibling;
  const root = document.documentElement;
  const detach = changes.some(([element]) => element !== root);
  if (detach) {
    body.remove();
    target.ariakitStyleCompareReattached = true;
  }
  for (const [element, name, value] of changes.toReversed()) {
    if (value == null) {
      element.removeAttribute(name);
    } else {
      element.setAttribute(name, value);
    }
  }
  // The saved states are those before any change, so their order does not
  // matter within a radio group.
  const checkedChanges = target.ariakitStyleCompareChecked ?? [];
  for (const [input, checked] of checkedChanges) {
    input.checked = checked;
  }
  if (detach) {
    root.insertBefore(body, bodyNext);
  }
  const selectorChanges = target.ariakitStyleCompareSelectors ?? [];
  for (const [rule, selector] of selectorChanges.toReversed()) {
    rule.selectorText = selector;
  }
  target.ariakitStyleCompareChanges = [];
  target.ariakitStyleCompareSelectors = [];
  target.ariakitStyleCompareChecked = [];
}

/**
 * Runs in the page after applyState and the emulated media of the page state.
 * Settles animations, and returns one style digest for each element.
 */
async function collectStyles(ignoreProperties: readonly string[]) {
  const target: StyleCompareWindow = window;
  const elements = target.ariakitStyleCompareElements;
  if (!elements) throw new Error("The page state was not applied");

  // A reattached body has new scroll timelines, which start on the next frames.
  // Before them, scroll-driven animations have no effect.
  if (target.ariakitStyleCompareReattached) {
    const nextFrame = () =>
      new Promise((resolve) => requestAnimationFrame(resolve));
    await nextFrame();
    await nextFrame();
    target.ariakitStyleCompareReattached = false;
  }

  // getAnimations() first applies the pending style changes, so it also returns
  // the transitions that the state or media change starts. Finite transitions
  // and animations jump to their end, so values do not depend on timing.
  // Infinite animations cannot finish, so they are canceled.
  const finishAnimations = () => {
    for (const animation of document.getAnimations()) {
      if (!(animation.timeline instanceof DocumentTimeline)) continue;
      try {
        animation.finish();
      } catch {
        animation.cancel();
      }
    }
  };
  finishAnimations();
  // Layout starts the loads of the fonts that the styles use.
  document.documentElement.getBoundingClientRect();
  await document.fonts.ready;
  finishAnimations();

  const { origin } = location;
  const isIgnored = (property: string) =>
    ignoreProperties.some((pattern) =>
      pattern.endsWith("*")
        ? property.startsWith(pattern.slice(0, -1))
        : property === pattern,
    );

  const readStyle = (element: Element, part: StylePart) => {
    const pseudo = part === "self" ? null : part;
    const style = getComputedStyle(element, pseudo);
    // A pseudo-element without content is not generated.
    if (pseudo && (style.content === "none" || style.content === "normal")) {
      return null;
    }
    const entries: StyleEntries = [];
    for (let i = 0; i < style.length; i++) {
      const property = style.item(i);
      if (isIgnored(property)) continue;
      // Computed url() values are absolute, and each build has its own origin.
      const value = style.getPropertyValue(property).replaceAll(origin, "");
      entries.push([property, value]);
    }
    return entries;
  };

  // 32-bit string hash (cyrb53 mixing).
  const hash = (text: string) => {
    let h1 = 0xdeadbeef;
    let h2 = 0x41c6ce57;
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);
      h1 = Math.imul(h1 ^ code, 2654435761);
      h2 = Math.imul(h2 ^ code, 1597334677);
    }
    h1 =
      Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
      Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    return h1 >>> 0;
  };

  // The sum and the XOR do not depend on the order of the properties. Chrome
  // lists registered custom properties in an order that changes between loads.
  const digest = (entries: StyleEntries | null) => {
    if (!entries) return "-";
    let sum = 0;
    let xor = 0;
    for (const [property, value] of entries) {
      const entryHash = hash(`${property}:${value}`);
      sum = (sum + entryHash) >>> 0;
      xor ^= Math.imul(entryHash, 2654435761);
    }
    return `${sum.toString(36)}.${(xor >>> 0).toString(36)}`;
  };

  // Keeps the styles for readElementStyles, which runs after the comparison.
  target.ariakitStyleCompare = { elements, readStyle };

  const positions = new Map(elements.map((element, index) => [element, index]));
  const collected: CollectedPage = {
    tags: elements.map((element) => element.localName),
    parents: elements.map((element) => {
      const parent = element.parentElement;
      return parent ? (positions.get(parent) ?? -1) : -1;
    }),
    digests: elements.map((element) =>
      [
        digest(readStyle(element, "self")),
        digest(readStyle(element, "::before")),
        digest(readStyle(element, "::after")),
      ].join("|"),
    ),
  };
  return collected;
}

/**
 * Runs in the page after collectStyles. Returns the styles of the elements at
 * the given positions, in the same order.
 */
function readElementStyles(indexes: number[]) {
  const target: StyleCompareWindow = window;
  const inspector = target.ariakitStyleCompare;
  if (!inspector) throw new Error("The page styles were not collected");
  return indexes.map((index): ElementStyles | null => {
    const element = inspector.elements[index];
    if (!element) return null;
    return {
      tag: element.localName,
      text: (element.textContent ?? "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 40),
      className: element.getAttribute("class") ?? "",
      self: inspector.readStyle(element, "self") ?? [],
      before: inspector.readStyle(element, "::before"),
      after: inspector.readStyle(element, "::after"),
    };
  });
}

/**
 * Describes the first difference between two element lists, or returns nothing
 * when they have the same tags and parents at each position.
 */
function getDomDifference(baseline: CollectedPage, current: CollectedPage) {
  const length = Math.max(baseline.tags.length, current.tags.length);
  for (let i = 0; i < length; i++) {
    const baselineTag = baseline.tags[i];
    const currentTag = current.tags[i];
    if (baselineTag !== currentTag) {
      const describe = (tag?: string) => (tag ? `<${tag}>` : "no element");
      return `DOM differs at element #${i}: ${describe(baselineTag)} in baseline, ${describe(currentTag)} in current`;
    }
    const baselineParent = baseline.parents[i];
    const currentParent = current.parents[i];
    if (baselineParent === currentParent) continue;
    return `DOM differs at element #${i}: <${currentTag}> is in #${baselineParent} in baseline, #${currentParent} in current`;
  }
  return;
}

function diffEntries(
  part: StylePart,
  baseline: StyleEntries | null,
  current: StyleEntries | null,
) {
  if (!baseline && !current) return [];
  // A pseudo-element that only one build generates differs by its content.
  if (!baseline || !current) {
    const entries = new Map(baseline ?? current);
    const content = entries.get("content");
    const change: StyleChange = baseline
      ? { part, property: "content", baseline: content, current: "none" }
      : { part, property: "content", baseline: "none", current: content };
    return [change];
  }
  const baselineMap = new Map(baseline);
  const currentMap = new Map(current);
  const properties = new Set([...baselineMap.keys(), ...currentMap.keys()]);
  const changes: StyleChange[] = [];
  for (const property of [...properties].sort()) {
    const baselineValue = baselineMap.get(property);
    const currentValue = currentMap.get(property);
    if (baselineValue === currentValue) continue;
    changes.push({
      part,
      property,
      baseline: baselineValue,
      current: currentValue,
    });
  }
  return changes;
}

function diffElementStyles(baseline: ElementStyles, current: ElementStyles) {
  return [
    ...diffEntries("self", baseline.self, current.self),
    ...diffEntries("::before", baseline.before, current.before),
    ...diffEntries("::after", baseline.after, current.after),
  ];
}

async function readDifferences(
  baselinePage: Page,
  currentPage: Page,
  indexes: number[],
) {
  if (!indexes.length) return [];
  const baseline = await baselinePage.evaluate(readElementStyles, indexes);
  const current = await currentPage.evaluate(readElementStyles, indexes);
  const differences: ElementDifference[] = [];
  for (let i = 0; i < indexes.length; i++) {
    const index = indexes[i];
    const baselineStyles = baseline[i];
    const currentStyles = current[i];
    if (index == null) continue;
    if (!baselineStyles) continue;
    if (!currentStyles) continue;
    differences.push({
      index,
      tag: currentStyles.tag,
      text: currentStyles.text,
      className: currentStyles.className,
      changes: diffElementStyles(baselineStyles, currentStyles),
    });
  }
  return differences;
}

async function compareMotion({
  pages,
  job,
  settings,
  rerun,
}: CompareMotionParams): Promise<PageStateResult> {
  // Both pages stay open, so the details below read the compared styles.
  const { ignoreProperties } = settings;
  const baseline = await pages.baseline.page.evaluate(
    collectStyles,
    ignoreProperties,
  );
  const current = await pages.current.page.evaluate(
    collectStyles,
    ignoreProperties,
  );

  const domDifference = getDomDifference(baseline, current);
  if (domDifference) {
    return { ...job, rerun, status: "error", message: domDifference };
  }
  const different: number[] = [];
  for (let i = 0; i < baseline.digests.length; i++) {
    if (baseline.digests[i] === current.digests[i]) continue;
    different.push(i);
  }
  const elements = baseline.digests.length;
  if (!different.length) {
    return { ...job, rerun, status: "same", elements };
  }
  const details = await readDifferences(
    pages.baseline.page,
    pages.current.page,
    different.slice(0, settings.details),
  );
  return {
    ...job,
    rerun,
    status: "diff",
    elements,
    different: different.length,
    details,
  };
}

function getTaskJobs(task: PageTask): StyleCompareJob[] {
  const { pagePath, browser } = task;
  return task.loads.flat().map((pair) => ({ pagePath, browser, ...pair }));
}

interface CompareLoadParams extends CompareTaskParams {
  load: PageLoad;
}

/**
 * Loads the page in both builds once, and compares it in each state and motion
 * preference of the load. Each state starts from the loaded page, because
 * restoreState undoes the previous one.
 */
async function compareLoad({
  pages,
  task,
  load,
  settings,
  rerun,
}: CompareLoadParams) {
  const [first] = load;
  if (!first) return [];
  const media = getMedia(first.state, first.motion);
  // The builds load one after the other, so the second load does not compete
  // with the first one.
  await loadPage(pages.baseline, task.pagePath, media);
  await loadPage(pages.current, task.pagePath, media);
  const { pagePath, browser } = task;
  const jobs = load.map((pair) => ({ pagePath, browser, ...pair }));
  const failures = [
    ...[...pages.baseline.failedStylesheets].map(
      ([file, reason]) => `${file} (${reason}) in baseline`,
    ),
    ...[...pages.current.failedStylesheets].map(
      ([file, reason]) => `${file} (${reason}) in current`,
    ),
  ];
  if (failures.length) {
    const message = `Stylesheets failed to load: ${failures.join(", ")}`;
    return jobs.map((job): PageStateResult => ({
      ...job,
      rerun,
      status: "error",
      message,
    }));
  }
  const results: PageStateResult[] = [];
  // The states of a load share its viewport and media, except for the motion
  // preference, which only switches forward (see getPageLoads).
  let motion = first.motion;
  for (const job of jobs) {
    if (job.motion !== motion) {
      motion = job.motion;
      await pages.baseline.page.emulateMedia({ reducedMotion: motion });
      await pages.current.page.emulateMedia({ reducedMotion: motion });
    }
    await pages.baseline.page.evaluate(applyState, job.state);
    await pages.current.page.evaluate(applyState, job.state);
    results.push(await compareMotion({ pages, job, settings, rerun }));
    await pages.baseline.page.evaluate(restoreState);
    await pages.current.page.evaluate(restoreState);
  }
  return results;
}

async function compareTask({
  pages,
  task,
  settings,
  rerun,
}: CompareTaskParams) {
  const results: PageStateResult[] = [];
  for (const load of task.loads) {
    const params = { pages, task, load, settings, rerun };
    results.push(...(await compareLoad(params)));
  }
  return results;
}

interface GetPageLoadsParams {
  pairs: StatePair[];
  motions: readonly StyleCompareMotion[];
  /** Whether each state has a load of its own. */
  splitStates: boolean;
}

/**
 * Groups the page states into loads. Each load goes through its states in one
 * motion preference, then in the next. On app pages, WebKit kept the styles of
 * `prefers-reduced-motion` rules after the emulated motion switched back on the
 * same page, so a load never switches back.
 */
function getPageLoads({ pairs, motions, splitStates }: GetPageLoadsParams) {
  const loads = new Map<StyleCompareState | "dom", PageLoad>();
  for (const pair of pairs) {
    const key = !splitStates && domStates.has(pair.state) ? "dom" : pair.state;
    const load = loads.get(key) ?? [];
    load.push(pair);
    loads.set(key, load);
  }
  const getMotionIndex = (pair: StatePair) => motions.indexOf(pair.motion);
  return [...loads.values()].map((load) =>
    load.toSorted((a, b) => getMotionIndex(a) - getMotionIndex(b)),
  );
}

interface CreateTasksParams {
  pages: Map<string, number>;
  browser: StyleCompareBrowser;
  states: readonly StyleCompareState[];
  motions: readonly StyleCompareMotion[];
}

/**
 * Creates one task for each page, or one for each state of a large page, with
 * the largest tasks first.
 */
function createTasks({ pages, browser, states, motions }: CreateTasksParams) {
  const pairs = states.flatMap((state) =>
    motions.map((motion) => ({ state, motion })),
  );
  const tasks: PageTask[] = [];
  for (const [pagePath, elements] of pages) {
    const splitStates = elements > LARGE_PAGE_ELEMENTS;
    const loads = getPageLoads({ pairs, motions, splitStates });
    if (!splitStates) {
      const size = elements * pairs.length;
      tasks.push({ pagePath, browser, loads, size });
      continue;
    }
    for (const load of loads) {
      const size = elements * load.length;
      tasks.push({ pagePath, browser, loads: [load], size });
    }
  }
  return tasks.sort((a, b) => b.size - a.size);
}

/**
 * Compares the tasks on a shared queue. Each worker owns one browser. A task
 * that throws, such as after a browser crash or a timeout, goes back to the
 * queue until it reaches the maximum number of attempts.
 */
async function runTasks({
  browser,
  tasks,
  workers,
  settings,
  rerun,
  onResult,
}: RunTasksParams) {
  const queue = tasks.map((task) => ({ task, attempts: 0 }));
  const results: PageStateResult[] = [];
  const addResult = (result: PageStateResult) => {
    results.push(result);
    onResult?.(result);
  };
  const work = async () => {
    await using session = createWorkerSession(browser, settings);
    for (let item = queue.shift(); item; item = queue.shift()) {
      // A browser that cannot launch stops the run. The other workers stop
      // after their current task.
      const pages = await session.get().catch((error: unknown) => {
        queue.length = 0;
        throw error;
      });
      try {
        const task = item.task;
        const taskResults = await compareTask({ pages, task, settings, rerun });
        for (const result of taskResults) {
          addResult(result);
        }
      } catch (error) {
        // The pages can be in any state after an error, such as a timeout.
        await session.reset();
        item.attempts += 1;
        if (item.attempts < MAX_ATTEMPTS) {
          queue.push(item);
          continue;
        }
        const message = `Failed after ${item.attempts} attempts: ${getErrorMessage(error)}`;
        for (const job of getTaskJobs(item.task)) {
          addResult({ ...job, rerun, status: "error", message });
        }
      }
    }
  };
  const workerCount = Math.max(1, Math.min(workers, tasks.length));
  const settled = await Promise.allSettled(
    Array.from({ length: workerCount }, work),
  );
  for (const outcome of settled) {
    if (outcome.status === "rejected") throw outcome.reason;
  }
  return results;
}

interface GetRerunTasksParams {
  results: PageStateResult[];
  states: readonly StyleCompareState[];
  motions: readonly StyleCompareMotion[];
}

/**
 * Groups the results that did not match into one task for each page, with the
 * states and motion preferences in the order of the first pass.
 */
function getRerunTasks({ results, states, motions }: GetRerunTasksParams) {
  const tasks = new Map<string, PageTask>();
  for (const result of results) {
    if (tasks.has(result.pagePath)) continue;
    const pageResults = results.filter(
      (other) => other.pagePath === result.pagePath,
    );
    const pairs = states.flatMap((state) =>
      motions
        .filter((motion) =>
          pageResults.some(
            (other) => other.state === state && other.motion === motion,
          ),
        )
        .map((motion) => ({ state, motion })),
    );
    const loads = getPageLoads({ pairs, motions, splitStates: false });
    const { pagePath, browser } = result;
    tasks.set(pagePath, { pagePath, browser, loads, size: 0 });
  }
  return [...tasks.values()];
}

function truncate(value: string, length: number) {
  if (value.length <= length) return value;
  return `${value.slice(0, length - 1)}…`;
}

function formatValue(value?: string) {
  if (value == null) return "(none)";
  return truncate(value, MAX_VALUE_LENGTH);
}

function formatJob(job: StyleCompareJob) {
  return `${job.pagePath} [${job.browser}, motion ${job.motion}, ${job.state}]`;
}

/**
 * Groups the changes that have the same part and values. Derived properties,
 * such as the border colors that follow `currentColor`, change together with
 * the property that they derive from.
 */
function groupChanges(changes: StyleChange[]) {
  const groups = new Map<string, ChangeGroup>();
  for (const change of changes) {
    const key = JSON.stringify([change.part, change.baseline, change.current]);
    const group = groups.get(key);
    if (group) {
      group.properties.push(change.property);
      continue;
    }
    groups.set(key, {
      part: change.part,
      properties: [change.property],
      baseline: change.baseline,
      current: change.current,
    });
  }
  return [...groups.values()];
}

function formatChangeGroup(group: ChangeGroup) {
  const part = group.part === "self" ? "" : `${group.part} `;
  // The property that the others derive from usually has the shortest name,
  // such as color before caret-color and outline-color.
  const properties = group.properties.toSorted(
    (a, b) => a.length - b.length || (a < b ? -1 : 1),
  );
  const shown = properties.slice(0, MAX_PROPERTY_NAMES).join(", ");
  const hidden = properties.length - MAX_PROPERTY_NAMES;
  const more = hidden > 0 ? ` (+${hidden} more)` : "";
  return `${part}${shown}${more}: ${formatValue(group.baseline)} -> ${formatValue(group.current)}`;
}

function formatElement(difference: ElementDifference) {
  const classes = difference.className.split(/\s+/).filter(Boolean);
  const classText = classes.length
    ? ` .${classes.slice(0, MAX_CLASSES).join(".")}`
    : "";
  const lines = [
    `    #${difference.index} <${difference.tag}> "${difference.text}"${classText}`,
  ];
  const groups = groupChanges(difference.changes);
  const shown = groups.slice(0, MAX_CHANGE_LINES);
  for (const group of shown) {
    lines.push(`        ${formatChangeGroup(group)}`);
  }
  const hidden = groups.length - shown.length;
  if (hidden > 0) {
    lines.push(`        (+${hidden} more changes)`);
  }
  return lines;
}

/**
 * Formats one result as a `same`, `DIFF`, or `ERROR` line, followed by the
 * details of each different element.
 */
export function formatPageStateResult(result: PageStateResult) {
  const job = formatJob(result);
  if (result.status === "error") {
    return [`ERROR ${job} ${result.message}`];
  }
  if (result.status === "same") {
    const note = result.rerun ? " (differed in the parallel pass)" : "";
    return [`same  ${job} ${result.elements} elements${note}`];
  }
  const lines = [
    `DIFF  ${job} ${result.elements} elements, ${result.different} different`,
  ];
  for (const difference of result.details) {
    lines.push(...formatElement(difference));
  }
  const hidden = result.different - result.details.length;
  if (hidden > 0) {
    lines.push(`    (+${hidden} more elements)`);
  }
  return lines;
}

function formatSummary(label: string, results: PageStateResult[]) {
  const count = (status: PageStateResult["status"]) =>
    results.filter((result) => result.status === status).length;
  const sameAlone = results.filter(
    (result) => result.status === "same" && result.rerun,
  ).length;
  const note = sameAlone ? ` (${sameAlone} same only when run alone)` : "";
  return `${label}: ${results.length} page states, ${count("same")} same, ${count("diff")} different, ${count("error")} with errors${note}`;
}

function getStateIndex(state: StyleCompareState) {
  return styleCompareStates.indexOf(state);
}

function sortResults(
  results: PageStateResult[],
  motions: readonly StyleCompareMotion[],
) {
  return results.toSorted((a, b) => {
    if (a.motion !== b.motion) {
      return motions.indexOf(a.motion) - motions.indexOf(b.motion);
    }
    if (a.pagePath !== b.pagePath) return a.pagePath < b.pagePath ? -1 : 1;
    return getStateIndex(a.state) - getStateIndex(b.state);
  });
}

/**
 * Returns whether the report has any difference, error, or page that only one
 * build has.
 */
export function hasStyleCompareFailures(report: StyleCompareReport) {
  if (report.missing.length) return true;
  return report.results.some((result) => result.status !== "same");
}

/**
 * Compares the computed styles of the pages of two builds in each browser,
 * motion preference, and state. Prints one line for each page state, and the
 * details of each difference. Page states that do not match in the parallel
 * pass run again alone before the report when at most 50 of them differ,
 * because sub-pixel geometry can change when many pages load at the same time.
 */
export async function runStyleCompare({
  baseline,
  current,
  pages: prefixes = [],
  browsers = styleCompareBrowsers,
  motions = styleCompareMotions,
  states = styleCompareStates,
  workers = getDefaultWorkers(),
  details = DEFAULT_DETAILS,
  ignoreProperties = [],
  log = console.log,
}: StyleCompareOptions): Promise<StyleCompareReport> {
  if (!browsers.length || !motions.length || !states.length) {
    throw new Error("Choose at least one browser, motion, and state.");
  }
  const baselineRoot = path.resolve(baseline);
  const currentRoot = path.resolve(current);
  const matches = (pagePath: string) =>
    !prefixes.length ||
    prefixes.some((prefix) => matchesPrefix(pagePath, prefix));
  const baselineFound = await findPages(baselineRoot);
  const baselinePages = [...baselineFound.keys()].filter(matches).sort();
  const currentPages = [...(await findPages(currentRoot)).keys()]
    .filter(matches)
    .sort();
  const currentSet = new Set(currentPages);
  const baselineSet = new Set(baselinePages);
  const pages = baselinePages.filter((pagePath) => currentSet.has(pagePath));
  const missing: MissingPage[] = [
    ...baselinePages
      .filter((pagePath) => !currentSet.has(pagePath))
      .map((pagePath) => ({ pagePath, onlyIn: "baseline" as const })),
    ...currentPages
      .filter((pagePath) => !baselineSet.has(pagePath))
      .map((pagePath) => ({ pagePath, onlyIn: "current" as const })),
  ];
  for (const page of missing) {
    log(`ERROR ${page.pagePath} is only in the ${page.onlyIn} build`);
  }
  // An empty comparison would pass, such as when a build folder is wrong.
  if (!pages.length) {
    throw new Error(
      "No page is in both builds. Check the build folders and page prefixes.",
    );
  }

  await using baselineServer = createStaticServer(baselineRoot);
  await using currentServer = createStaticServer(currentRoot);
  const settings: CompareSettings = {
    baselineOrigin: await listen(baselineServer),
    currentOrigin: await listen(currentServer),
    details,
    ignoreProperties,
  };

  const results: PageStateResult[] = [];
  for (const browser of browsers) {
    const pageSizes = new Map(
      pages.map((pagePath) => [pagePath, baselineFound.get(pagePath) ?? 0]),
    );
    const tasks = createTasks({ pages: pageSizes, browser, states, motions });
    log(
      `${browser}: ${pages.length} pages in ${states.length} states, motion ${motions.join(" and ")}, ${Math.min(workers, tasks.length)} workers`,
    );
    const parallelResults = await runTasks({
      browser,
      tasks,
      workers,
      settings,
      rerun: false,
      // Results that do not match wait for the alone pass below.
      onResult: (result) => {
        if (result.status === "same" || workers <= 1) {
          log(formatPageStateResult(result).join("\n"));
        }
      },
    });
    let browserResults = parallelResults;
    const unmatched = parallelResults.filter(
      (result) => result.status !== "same",
    );
    if (workers > 1 && unmatched.length > MAX_ALONE_RERUNS) {
      log(
        `${browser}: ${unmatched.length} page states do not match, more than ${MAX_ALONE_RERUNS}, so they do not run again alone`,
      );
      for (const result of sortResults(unmatched, motions)) {
        log(formatPageStateResult(result).join("\n"));
      }
    } else if (workers > 1 && unmatched.length) {
      log(`${browser}: running ${unmatched.length} page states again alone`);
      const aloneResults = await runTasks({
        browser,
        tasks: getRerunTasks({ results: unmatched, states, motions }),
        workers: 1,
        settings,
        rerun: true,
      });
      for (const result of sortResults(aloneResults, motions)) {
        log(formatPageStateResult(result).join("\n"));
      }
      browserResults = [
        ...parallelResults.filter((result) => result.status === "same"),
        ...aloneResults,
      ];
    }
    for (const motion of motions) {
      const motionResults = browserResults.filter(
        (result) => result.motion === motion,
      );
      log(formatSummary(`${browser}, motion ${motion}`, motionResults));
    }
    results.push(...sortResults(browserResults, motions));
  }
  if (browsers.length * motions.length > 1) {
    log(formatSummary("Total", results));
  }
  return { pages, missing, results };
}
