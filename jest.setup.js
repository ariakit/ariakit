const jestDOMMatchers = require("@testing-library/jest-dom/matchers");
const failOnConsole = require("jest-fail-on-console");
const {
  matcherHint,
  printReceived,
  printExpected,
} = require("jest-matcher-utils");

failOnConsole();

/**
 * Consider [aria-activedescendant="${id}"] #${id} as the focused element.
 * @param {HTMLElement} element
 */
function toHaveFocus(element) {
  const result = matchers.toHaveFocus.call(this, element);
  const { activeElement } = element.ownerDocument;
  const activeId =
    activeElement && activeElement.getAttribute("aria-activedescendant");
  return {
    ...result,
    pass: result.pass || activeId === element.id,
    message: () => {
      if (activeId) {
        return [
          matcherHint(`${this.isNot ? ".not" : ""}.toHaveFocus`, "element", ""),
          "",
          "Expected:",
          `  ${printExpected(element)}`,
          "Received:",
          `  ${printReceived(element.ownerDocument.getElementById(activeId))}`,
        ].join("\n");
      }
      return result.message();
    },
  };
}

const { __esModule, ...matchers } = jestDOMMatchers;
expect.extend({ ...matchers, toHaveFocus });
