import matchers, {
  TestingLibraryMatchers,
} from "@testing-library/jest-dom/matchers";
// @ts-expect-error
import failOnConsole from "vitest-fail-on-console";

failOnConsole();

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Vi {
    interface JestAssertion<T = any>
      extends jest.Matchers<void, T>,
        TestingLibraryMatchers<T, void> {}
  }
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
              ""
            ),
            "",
            "Expected:",
            `  ${this.utils.printExpected(element)}`,
            "Received:",
            `  ${this.utils.printReceived(
              element.ownerDocument.getElementById(activeId)
            )}`,
          ].join("\n");
        }
        return result.message();
      },
    };
  },
});
