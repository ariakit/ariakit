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

const ALLOWED_TEST_LOADERS = ["react", "solid"] as const;
type AllowedTestLoader = (typeof ALLOWED_TEST_LOADERS)[number];

const TEST_LOADER = (process.env.ARIAKIT_TEST_LOADER ??
  "react") as AllowedTestLoader;

if (!ALLOWED_TEST_LOADERS.includes(TEST_LOADER)) {
  throw new Error(`Invalid loader: ${TEST_LOADER}`);
}

async function tryImport(path: string, fallbackPath?: string) {
  return await import(path).catch(() =>
    fallbackPath ? import(fallbackPath) : { failedImport: true },
  );
}

async function loadReact(example: string) {
  const { default: comp, failedImport } = await tryImport(
    `./examples/${example}/index.react.tsx`,
    `./examples/${example}/index.tsx`,
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

async function loadSolid(example: string) {
  const { default: comp, failedImport } = await tryImport(
    `./examples/${example}/index.solid.tsx`,
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
  (example: string) => Promise<void | (() => void) | false>
>;

beforeEach(async ({ task, skip }) => {
  const filename = task.file?.name;
  if (!filename) return;
  const match = filename.match(/examples\/(.*)\/test.ts$/);
  if (!match) return;
  const [, example] = match;
  if (!example) return;
  const result = await LOADERS[TEST_LOADER](example);
  if (result === false) skip();
  return result;
});
