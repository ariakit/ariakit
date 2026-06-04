import "@testing-library/jest-dom/vitest";
import { render as renderReact } from "@ariakit/test/react";
import * as matchers from "@testing-library/jest-dom/matchers";
import { createElement, Suspense as ReactSuspense } from "react";
import {
  createComponent,
  render as renderSolid,
  Suspense as SolidSuspense,
} from "solid-js/web";
import { expect, beforeEach } from "vitest";
import failOnConsole from "vitest-fail-on-console";
import { getTestLoader, isAllowedTestLoader } from "./test-loader.ts";
import type { AllowedTestLoader } from "./test-loader.ts";

failOnConsole();

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
    // oxlint-disable-next-line react/no-children-prop -- createElement requires children prop
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

Note: Vitest `test.ts` files run in Browser Mode for framework render suites.
Files named `test-<browser target>.` are separate Playwright preview tests.
Available Playwright targets are:

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
    /^(?<dir>(?:.*\/)?(?:examples|sandbox)\/.+?)\/test\.((?<loader>react|solid)\.)?ts$/,
  );
  if (!match?.groups) return false;
  const { dir, loader } = match.groups;
  if (!dir) return false;
  if (loader && !isAllowedTestLoader(loader)) return false;
  return {
    dir,
    loader: loader ?? "all",
  };
}

beforeEach(async ({ task, skip }) => {
  const parseResult = parseTest(task.file?.name);
  if (!parseResult) return;
  const loader = getTestLoader();
  if (!loader) {
    skip();
    return;
  }
  const { dir, loader: testLoader } = parseResult;
  if (testLoader !== "all" && testLoader !== loader) {
    skip();
    return;
  }
  const result = await LOADERS[loader](dir);
  if (result === false) skip();
  return result;
});
