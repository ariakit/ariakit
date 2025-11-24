import "@testing-library/jest-dom/vitest";

import { render as renderReact } from "@ariakit/test/react";
import * as matchers from "@testing-library/jest-dom/matchers";
import { createElement, Suspense as ReactSuspense, version } from "react";
import {
  createComponent,
  render as renderSolid,
  Suspense as SolidSuspense,
} from "solid-js/web";
import failOnConsole from "vitest-fail-on-console";
import type { AllowedTestLoader } from "./vitest.config.ts";

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

async function tryImport(path: string) {
  return import(path)
    .then(({ default: component }) => ({ component, failedImport: false }))
    .catch(() => ({ component: undefined, failedImport: true }));
}

async function loadReact(dir: string) {
  const { component, failedImport } = await tryImport(
    `./${dir}/index.react.tsx`,
  );
  if (failedImport) return false;
  const element = createElement(ReactSuspense, {
    fallback: null,
    // biome-ignore lint/correctness/noChildrenProp: createElement requires children prop
    children: createElement(component),
  });
  const { unmount } = await renderReact(element, { strictMode: true });
  return unmount;
}

async function loadSolid(dir: string) {
  const { component, failedImport } = await tryImport(
    `./${dir}/index.solid.tsx`,
  );
  if (failedImport) return false;
  const div = document.createElement("div");
  document.body.appendChild(div);
  const dispose = renderSolid(
    () =>
      createComponent(SolidSuspense, {
        fallback: null,
        get children() {
          return createComponent(component, {});
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
  (dir: string) => Promise<void | (() => void) | false>
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
    /(?<dir>.*)\/test\.((?<loader>react|solid)\.)?ts$/,
  );
  if (!match?.groups) return false;
  const { dir, loader } = match.groups;
  if (!dir) return false;
  return {
    dir,
    loader: (loader ?? "all") as AllowedTestLoader | "all",
  };
}

const LOADER = (process.env.ARIAKIT_TEST_LOADER ??
  "react") as AllowedTestLoader;

beforeEach(async ({ task, skip }) => {
  const parseResult = parseTest(task.file?.name);
  if (!parseResult) return;
  const { dir, loader } = parseResult;
  if (loader !== "all" && loader !== LOADER) skip();
  const result = await LOADERS[LOADER](dir);
  if (result === false) skip();
  return result;
});
