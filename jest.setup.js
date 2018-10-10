import "jest-dom/extend-expect";
import "jest-styled-components";
import "react-testing-library/cleanup-after-each";
import "raf/polyfill";
import { configure } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

configure({ adapter: new Adapter() });

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
