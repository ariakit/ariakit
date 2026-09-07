import * as matchers from "@testing-library/jest-dom/matchers";
import { expect } from "vitest";
import failOnConsole from "vitest-fail-on-console";

failOnConsole();

// The CommonJS declaration exposes a default export absent from the ESM API.
const { default: _default, ...domMatchers } = matchers;

expect.extend({
  ...domMatchers,
  toHaveFocus(element: HTMLElement) {
    const result = matchers.toHaveFocus.call(this, element);
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
