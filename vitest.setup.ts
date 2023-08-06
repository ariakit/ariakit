import { Suspense, createElement, version } from "react";
import { render } from "@ariakit/test";
import type { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers.js";
import _matchers from "@testing-library/jest-dom/matchers.js";
import failOnConsole from "vitest-fail-on-console";

const matchers = _matchers as unknown as typeof _matchers.default;

declare module "vitest" {
  interface JestAssertion<T = any>
    extends jest.Matchers<void, T>,
      TestingLibraryMatchers<T, void> {}
}

if (!version.startsWith("17")) {
  failOnConsole();
}

expect.extend(matchers);

expect.extend({
  toHaveFocus(element: HTMLElement, expected, options) {
    const toHaveFocus = matchers.toHaveFocus.bind(this) as any;
    const result = toHaveFocus(element, expected, options);
    const { activeElement } = element.ownerDocument;
    const activeId =
      activeElement && activeElement.getAttribute("aria-activedescendant");
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
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    const actual = await vi.importActual<typeof import("react")>("react");
    const mocks = {
      startTransition: (v: () => any) => v(),
      useDeferredValue: <T>(v: T) => v,
      useTransition: () => [false, (v: () => any) => v()],
      useId: () => {
        const [id, setId] = actual.useState<string | undefined>();
        actual.useLayoutEffect(() => {
          const random = Math.random().toString(36).substr(2, 6);
          setId(`id-${random}`);
        }, []);
        return id;
      },
    };
    return { ...mocks, ...actual };
  });
}

beforeEach(async ({ meta }) => {
  const filename = meta.file?.name;
  if (!filename) return;
  const match = filename.match(/examples\/(.*)\/test.ts$/);
  if (!match) return;
  const [, example] = match;
  const { default: comp } = await import(`./examples/${example}/index.tsx`);
  const { unmount } = render(
    createElement(Suspense, { fallback: null, children: createElement(comp) }),
  );
  return unmount;
});
