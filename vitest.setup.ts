import "@testing-library/jest-dom/vitest";

import { render } from "@ariakit/test/react";
import * as matchers from "@testing-library/jest-dom/matchers";
import { Suspense, createElement, version } from "react";
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

beforeEach(async ({ task }) => {
  const filename = task.file?.name;
  if (!filename) return;
  const match = filename.match(/examples\/(.*)\/test.ts$/);
  if (!match) return;
  const [, example] = match;
  const { default: comp } = await import(`./examples/${example}/index.tsx`);
  const element = createElement(Suspense, {
    fallback: null,
    // biome-ignore lint/correctness/noChildrenProp:
    children: createElement(comp),
  });
  const unmount = await render(element, { strictMode: true });
  return unmount;
});
