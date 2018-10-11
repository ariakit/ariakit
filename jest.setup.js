import "jest-dom/extend-expect";
import "jest-styled-components";
import "react-testing-library/cleanup-after-each";
import "raf/polyfill";

// polyfill for document.createRange
if (global.document) {
  document.createRange = () => ({
    setStart: () => {},
    setEnd: () => {},
    commonAncestorContainer: {
      nodeName: "BODY",
      ownerDocument: document
    }
  });
}
