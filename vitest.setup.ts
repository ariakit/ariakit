import "@testing-library/jest-dom/vitest";

import { render as renderReact } from "@ariakit/test/react";
import * as matchers from "@testing-library/jest-dom/matchers";
import { Suspense as ReactSuspense, createElement, version } from "react";
import {
  Suspense as SolidSuspense,
  createComponent,
  render as renderSolid,
} from "solid-js/web";
import failOnConsole from "vitest-fail-on-console";

if (!version.startsWith("17")) {
  failOnConsole();
}

expect.extend({
  toHaveFocus(element: HTMLElement, expected, options) {
    const toHaveFocus = matchers.toHaveFocus.bind(this) as any;
    const result = toHaveFocus(element, expected, options);
    const { activeElement } = element.ownerDocument;
    const activeId = activeElement?.getAttribute("aria-activedescendant");
    return {
      ...result,
      pass: result.pass || activeId === element.id,
      message: () => {
        if (activeId) {
          return [
            this.utils.matcherHint(
              `${this.isNot ? ".not" : ""}.toHaveFocus`,
              "element",
              "",
            ),
            "",
            "Expected:",
            `  ${this.utils.printExpected(element)}`,
            "Received:",
            `  ${this.utils.printReceived(
              element.ownerDocument.getElementById(activeId),
            )}`,
          ].join("\n");
        }
        return result.message();
      },
    };
  },
});

if (version.startsWith("17")) {
  vi.mock("react", async () => {
    const actual = await vi.importActual<typeof import("react")>("react");
    let id = 0;
    const mocks = {
      startTransition: (v: () => any) => v(),
      useDeferredValue: <T>(v: T) => v,
      useTransition: () => [false, (v: () => any) => v()],
      useId: () => actual.useMemo(() => `id-${id++}`, []),
    };
    return { ...mocks, ...actual };
  });
}

// test loaders
// ------------

const ALLOWED_TEST_LOADERS = ["react", "solid"] as const;
type AllowedTestLoader = (typeof ALLOWED_TEST_LOADERS)[number];

declare global {
  var loader: AllowedTestLoader;
}

const TEST_LOADER = (process.env.ARIAKIT_TEST_LOADER ??
  "react") as AllowedTestLoader;

beforeAll(() => {
  globalThis.loader = TEST_LOADER;
});

if (!ALLOWED_TEST_LOADERS.includes(TEST_LOADER)) {
  throw new Error(`Invalid loader: ${TEST_LOADER}`);
}

async function tryImport(path: string, fallbackPath?: string) {
  return await import(path).catch(() =>
    fallbackPath ? import(fallbackPath) : { failedImport: true },
  );
}

function fixtureName(unit = false) {
  return unit ? "unit" : "index";
}

async function loadReact(dir: string, unit: boolean) {
  const { default: comp, failedImport } = await tryImport(
    `./examples/${dir}/${fixtureName(unit)}.react.tsx`,
    `./examples/${dir}/${fixtureName(unit)}.tsx`,
  );
  if (failedImport) return false;
  const element = createElement(ReactSuspense, {
    fallback: null,
    // biome-ignore lint/correctness/noChildrenProp:
    children: createElement(comp),
  });
  const { unmount } = await renderReact(element, { strictMode: true });
  return unmount;
}

async function loadSolid(dir: string, unit: boolean) {
  const { default: comp, failedImport } = await tryImport(
    `./examples/${dir}/${fixtureName(unit)}.solid.tsx`,
  );
  if (failedImport) return false;
  const div = document.createElement("div");
  document.body.appendChild(div);
  const dispose = renderSolid(
    () =>
      createComponent(SolidSuspense, {
        fallback: null,
        get children() {
          return createComponent(comp, {});
        },
      }),
    div,
  );
  return () => {
    dispose();
    document.body.removeChild(div);
  };
}

const LOADERS = {
  react: loadReact,
  solid: loadSolid,
} satisfies Record<
  AllowedTestLoader,
  (dir: string, unit: boolean) => Promise<void | (() => void) | false>
>;

/*

Example/test naming conventions:

<example name>/
  index.<react|solid>.tsx        - example, the loader is optional and defaults to "react"
  test.ts                        - test, runs for all loaders
  test.<react|solid>.ts          - test, runs only for the specified loader

Note: test files can also be named `test-<browser target>.` instead of `test.` to run with Playwright. Available targets are:

- browser (all desktop browsers)
- chrome
- firefox
- safari
- mobile (all mobile browsers)
- ios
- android

*/

function parseTest(filename?: string) {
  if (!filename) return false;
  const match = filename.match(
    // @ts-expect-error Test runner is not limited by ES2017 target.
    /examples\/(?<dir>.*)\/(?<unit>unit\.)?test\.((?<loader>react|solid)\.)?ts$/,
  );
  if (!match?.groups) return false;
  const { dir, loader, unit } = match.groups;
  if (!dir) return false;
  return {
    dir,
    loader: (loader ?? "all") as AllowedTestLoader | "all",
    unit: Boolean(unit),
  };
}

beforeEach(async ({ task, skip }) => {
  const parseResult = parseTest(task.file?.name);
  if (!parseResult) return;
  const { dir, loader, unit } = parseResult;
  if (loader !== "all" && loader !== TEST_LOADER) skip();
  const result = await LOADERS[TEST_LOADER](dir, unit);
  if (result === false) skip();
  return result;
});
