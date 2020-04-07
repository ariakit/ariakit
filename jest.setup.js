const {
  matcherHint,
  printReceived,
  printExpected,
} = require("jest-matcher-utils");
const matchers = require("@testing-library/jest-dom/matchers");

// Consider [aria-activedescendant="${id}"] #${id} as the focused element.
function toHaveFocus(element) {
  const result = matchers.toHaveFocus(element);
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
          "Expected",
          `  ${printExpected(element)}`,
          "Received:",
          `  ${printReceived(element.ownerDocument.getElementById(activeId))}`,
        ].join("\n");
      }
      return result.message();
    },
  };
}

expect.extend({ ...matchers, toHaveFocus });
