import { beforeEach } from "vitest";

type Framework = "react" | "solid";

type FixtureLoader = (dir: string) => Promise<() => void>;

const documentClasses = ["min-h-[200vh]!"];
const bodyClasses = ["flex", "items-center-safe", "justify-center-safe"];
const containerClasses = [
  "@container",
  "size-full",
  "p-3",
  "flex",
  "items-center-safe",
  "justify-center-safe",
];

function addClasses(element: Element, classes: string[]) {
  const addedClasses = classes.filter(
    (className) => !element.classList.contains(className),
  );
  element.classList.add(...addedClasses);
  return () => element.classList.remove(...addedClasses);
}

export function setupPreviewContainer(fullscreen = false) {
  const container = document.createElement("div");
  container.classList.add("@container", "size-full");
  const restoreDocumentClasses = fullscreen
    ? () => {}
    : addClasses(document.documentElement, documentClasses);
  const restoreBodyClasses = fullscreen
    ? () => {}
    : addClasses(document.body, bodyClasses);
  if (!fullscreen) {
    container.classList.add(...containerClasses.slice(2));
  }
  document.body.append(container);
  return {
    container,
    cleanup() {
      container.remove();
      restoreBodyClasses();
      restoreDocumentClasses();
    },
  };
}

/*
 * Fixture grammar:
 * - `test.ts` runs for every matching `index.<framework>.tsx`.
 * - `<framework>.test.ts` runs only for that framework.
 * Playwright uses `test-<target>.ts`; targets are defined in
 * `app/playwright.config.ts`.
 */

function parseTest(filename?: string) {
  if (!filename) return false;
  const match = filename.match(
    /^(?<dir>(?:.*\/)?(?:examples|sandbox)\/.+?)\/((?<framework>react|solid)\.)?test\.ts$/,
  );
  if (!match?.groups) return false;
  const { dir, framework } = match.groups;
  if (!dir) return false;
  if (framework !== "react" && framework !== "solid") {
    return { dir, framework: "all" as const };
  }
  return { dir, framework };
}

export function setupFrameworkTests(
  framework: Framework,
  loadFixture: FixtureLoader,
) {
  beforeEach(async ({ task, skip }) => {
    const parseResult = parseTest(task.file?.name);
    if (!parseResult) return;
    const { dir, framework: testFramework } = parseResult;
    if (testFramework !== "all" && testFramework !== framework) {
      skip();
      return;
    }
    return loadFixture(dir);
  });
}
