import "@testing-library/jest-dom/vitest";

import { render as renderReact } from "@ariakit/test/react";
import * as matchers from "@testing-library/jest-dom/matchers";
import type { Test } from "@vitest/runner";
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

function createLoaderReact(component: any) {
  return async () => {
    const element = createElement(ReactSuspense, {
      fallback: null,
      // biome-ignore lint/correctness/noChildrenProp: createElement requires children prop
      children: createElement(component),
    });

    const { unmount } = await renderReact(element, {
      strictMode: true,
    });

    return unmount;
  };
}

function createLoaderSolid(component: any) {
  return () => {
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
  };
}

type Awaitable<T> = T | PromiseLike<T>;
type Cleanup = () => Awaitable<void>;
type Loader = () => Awaitable<Cleanup>;
type CreateLoader = (component: any) => Loader;

const loadersConfig = {
  react: {
    deriveFilePath: (dir) => `./${dir}/index.react.tsx`,
    createLoader: createLoaderReact,
  },
  solid: {
    deriveFilePath: (dir) => `./${dir}/index.solid.tsx`,
    createLoader: createLoaderSolid,
  },
} satisfies Record<
  AllowedTestLoader,
  {
    deriveFilePath(dir: string): string;
    createLoader: CreateLoader;
  }
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
  if (!filename) return;

  const match = filename.match(
    /(?<dir>.*)\/test\.((?<loader>react|solid)\.)?ts$/,
  );

  if (!match?.groups) return;
  const { dir, loader } = match.groups;
  if (!dir) return;

  return {
    dir,
    loaderKind: (loader ?? "all") as AllowedTestLoader | "all",
  };
}

const LOADER = (process.env.ARIAKIT_TEST_LOADER ??
  "react") as AllowedTestLoader;

type TestKind =
  | { type: "standard" }
  | { type: "skip" }
  | { type: "framework"; loader: Loader };

const cache = new Map<string, TestKind>();

/**
 * @summary
 * Cache the loader, if any, and the type of test.
 * Benchmarks would otherwise import the component on every cycle.
 */
async function createCachedLoader(test: Readonly<Test>): Promise<TestKind> {
  const standard = { type: "standard" } as const;
  const skip = { type: "skip" } as const;

  const parsed = parseTest(test.file?.name);

  if (!parsed) return standard;

  const { dir, loaderKind } = parsed;

  if (loaderKind !== "all" && loaderKind !== LOADER) {
    return skip;
  }
  const config = loadersConfig[LOADER];

  const filepath = config.deriveFilePath(dir);

  const component = await import(filepath)
    .then(({ default: component }) => component)
    .catch(() => null);

  // todo: throw?
  if (component === null) {
    return skip;
  }

  return { type: "framework", loader: config.createLoader(component) } as const;
}

beforeEach(async ({ task, skip }) => {
  if (!cache.has(task.id)) {
    cache.set(task.id, await createCachedLoader(task));
  }

  const kind = cache.get(task.id)!;

  switch (kind.type) {
    case "standard":
      return;
    case "skip":
      return skip();
    case "framework": {
      return await kind.loader();
    }
  }
});
