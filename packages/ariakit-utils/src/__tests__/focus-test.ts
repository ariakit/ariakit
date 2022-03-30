import * as dom from "../dom";
import {
  disableFocus,
  disableFocusIn,
  ensureFocus,
  focusIfNeeded,
  getAllFocusable,
  getAllFocusableIn,
  getAllTabbable,
  getAllTabbableIn,
  getClosestFocusable,
  getFirstFocusable,
  getFirstFocusableIn,
  getFirstTabbable,
  getFirstTabbableIn,
  getLastTabbable,
  getLastTabbableIn,
  getNextTabbable,
  getNextTabbableIn,
  getPreviousTabbable,
  getPreviousTabbableIn,
  hasFocus,
  hasFocusWithin,
  isFocusable,
  isTabbable,
  restoreFocusIn,
} from "../focus";

jest.mock("../dom");

// Abstract back and share?
function getById<T extends HTMLElement = HTMLElement>(id: string) {
  return document.getElementById(id) as T;
}

const mockDom = dom as jest.Mocked<typeof dom>;

test("isFocusable", () => {
  const element = document.createElement("div");

  // Mock matches and isVisible because those functions are tested elsewhere.

  // Both true
  mockDom.matches.mockReturnValue(true);
  mockDom.isVisible.mockReturnValue(true);
  expect(isFocusable(element)).toBe(true);

  // Matches false
  mockDom.matches.mockReturnValue(false);
  expect(isFocusable(element)).toBe(false);
  mockDom.matches.mockReturnValue(true);

  // Visible false
  mockDom.isVisible.mockReturnValue(false);
  expect(isFocusable(element)).toBe(false);
  mockDom.isVisible.mockReturnValue(false);

  // Matches and visible false
  mockDom.matches.mockReturnValue(false);
  mockDom.isVisible.mockReturnValue(false);
  expect(isFocusable(element)).toBe(false);

  mockDom.matches.mockRestore();
  mockDom.isVisible.mockRestore();
});

test("isTabbable", () => {
  const initialInnerHTML = document.body.innerHTML;
  document.body.innerHTML = `
    <input id="input" />
    <input id="inputNegativeTabIndex" tabindex="-1" />
    <input id="inputZeroTabIndex" tabindex="0" />
    <input id="inputPositiveTabIndex" tabindex="1" />
  `;
  const input = getById("input");
  const inputNegativeTabIndex = getById("inputNegativeTabIndex");
  const inputZeroTabIndex = getById("inputZeroTabIndex");
  const inputPositiveTabIndex = getById("inputPositiveTabIndex");

  // This test also test hasNegativeTabIndex because it's called by isTabbable.

  // Mock matches and isVisible to mock isFocusable.

  // isFocusable true
  mockDom.matches.mockReturnValue(true);
  mockDom.isVisible.mockReturnValue(true);

  expect(isTabbable(input)).toBe(true);
  expect(isTabbable(inputNegativeTabIndex)).toBe(false);
  expect(isTabbable(inputZeroTabIndex)).toBe(true);
  expect(isTabbable(inputPositiveTabIndex)).toBe(true);

  // isFocusable false
  // Really only one of these needs to be false but 🤷‍♂️
  mockDom.matches.mockReturnValue(false);
  mockDom.isVisible.mockReturnValue(false);

  expect(isTabbable(input)).toBe(false);
  expect(isTabbable(inputNegativeTabIndex)).toBe(false);
  expect(isTabbable(inputZeroTabIndex)).toBe(false);
  expect(isTabbable(inputPositiveTabIndex)).toBe(false);

  mockDom.matches.mockRestore();
  mockDom.isVisible.mockRestore();
  document.body.innerHTML = initialInnerHTML;
});

test("getAllFocusableIn", () => {
  const initialInnerHTML = document.body.innerHTML;
  document.body.innerHTML = `
    <div id="container">
      <input id="input" />
      <input id="inputNegativeTabIndex" tabindex="-1" />
      <input id="inputZeroTabIndex" tabindex="0" />
      <input id="inputPositiveTabIndex" tabindex="1" />
    </div>
  `;
  const container = getById("container");
  const input = getById("input");
  const inputNegativeTabIndex = getById("inputNegativeTabIndex");
  const inputZeroTabIndex = getById("inputZeroTabIndex");
  const inputPositiveTabIndex = getById("inputPositiveTabIndex");

  // Mock matches and isVisible to mock isFocusable.
  // isFocusable true
  mockDom.matches.mockReturnValue(true);
  mockDom.isVisible.mockReturnValue(true);

  expect(getAllFocusableIn(container)).toEqual([
    input,
    inputNegativeTabIndex,
    inputZeroTabIndex,
    inputPositiveTabIndex,
  ]);
  expect(getAllFocusableIn(container, true)).toEqual([
    container,
    input,
    inputNegativeTabIndex,
    inputZeroTabIndex,
    inputPositiveTabIndex,
  ]);

  mockDom.matches.mockRestore();
  mockDom.isVisible.mockRestore();
  document.body.innerHTML = initialInnerHTML;
});

test("getAllFocusable", () => {
  const initialInnerHTML = document.body.innerHTML;
  document.body.innerHTML = `
    <div id="container">
      <input id="input" />
      <input id="inputNegativeTabIndex" tabindex="-1" />
      <input id="inputZeroTabIndex" tabindex="0" />
      <input id="inputPositiveTabIndex" tabindex="1" />
    </div>
  `;
  const input = getById("input");
  const inputNegativeTabIndex = getById("inputNegativeTabIndex");
  const inputZeroTabIndex = getById("inputZeroTabIndex");
  const inputPositiveTabIndex = getById("inputPositiveTabIndex");

  // Mock matches and isVisible to mock isFocusable.
  // isFocusable true
  mockDom.matches.mockReturnValue(true);
  mockDom.isVisible.mockReturnValue(true);

  expect(getAllFocusable()).toEqual([
    input,
    inputNegativeTabIndex,
    inputZeroTabIndex,
    inputPositiveTabIndex,
  ]);
  expect(getAllFocusable(true)).toEqual([
    document.body,
    input,
    inputNegativeTabIndex,
    inputZeroTabIndex,
    inputPositiveTabIndex,
  ]);

  mockDom.matches.mockRestore();
  mockDom.isVisible.mockRestore();
  document.body.innerHTML = initialInnerHTML;
});

test("getFirstFocusableIn", () => {
  const initialInnerHTML = document.body.innerHTML;
  document.body.innerHTML = `
    <div id="container">
      <input id="input" />
      <input id="inputNegativeTabIndex" tabindex="-1" />
      <input id="inputZeroTabIndex" tabindex="0" />
      <input id="inputPositiveTabIndex" tabindex="1" />
    </div>
  `;
  const container = getById("container");
  const input = getById("input");

  // Mock matches and isVisible to mock isFocusable.
  // isFocusable true
  mockDom.matches.mockReturnValue(true);
  mockDom.isVisible.mockReturnValue(true);

  expect(getFirstFocusableIn(container)).toBe(input);
  expect(getFirstFocusableIn(container, true)).toBe(container);

  mockDom.matches.mockRestore();
  mockDom.isVisible.mockRestore();
  document.body.innerHTML = initialInnerHTML;
});

test("getFirstFocusable", () => {
  const initialInnerHTML = document.body.innerHTML;
  document.body.innerHTML = `
    <div id="container">
      <input id="input" />
      <input id="inputNegativeTabIndex" tabindex="-1" />
      <input id="inputZeroTabIndex" tabindex="0" />
      <input id="inputPositiveTabIndex" tabindex="1" />
    </div>
  `;
  const input = getById("input");

  // Mock matches and isVisible to mock isFocusable.
  // isFocusable true
  mockDom.matches.mockReturnValue(true);
  mockDom.isVisible.mockReturnValue(true);

  expect(getFirstFocusable()).toBe(input);
  expect(getFirstFocusable(true)).toBe(document.body);

  mockDom.matches.mockRestore();
  mockDom.isVisible.mockRestore();
  document.body.innerHTML = initialInnerHTML;
});

test("getAllTabbableIn", () => {
  const initialInnerHTML = document.body.innerHTML;
  document.body.innerHTML = `
    <div id="container">
      <input id="input" />
      <input id="inputNegativeTabIndex" tabindex="-1" />
      <input id="inputZeroTabIndex" tabindex="0" />
      <input id="inputPositiveTabIndex" tabindex="1" />
    </div>
    <div id="container2" />
  `;
  const container = getById("container");
  const input = getById("input");
  const inputZeroTabIndex = getById("inputZeroTabIndex");
  const inputPositiveTabIndex = getById("inputPositiveTabIndex");
  const container2 = getById("container2");

  // Mock matches and isVisible to mock isFocusable.
  // isFocusable true
  mockDom.matches.mockReturnValue(true);
  mockDom.isVisible.mockReturnValue(true);

  expect(getAllTabbableIn(container)).toEqual([
    input,
    inputZeroTabIndex,
    inputPositiveTabIndex,
  ]);
  expect(getAllTabbableIn(container, true)).toEqual([
    container,
    input,
    inputZeroTabIndex,
    inputPositiveTabIndex,
  ]);
  expect(getAllTabbableIn(container, true, true)).toEqual([
    container,
    input,
    inputZeroTabIndex,
    inputPositiveTabIndex,
  ]);

  expect(getAllTabbableIn(container2)).toEqual([]);
  expect(getAllTabbableIn(container2, true)).toEqual([container2]);
  expect(getAllTabbableIn(container2, false, true)).toEqual([]);

  mockDom.matches.mockRestore();
  mockDom.isVisible.mockRestore();
  document.body.innerHTML = initialInnerHTML;
});

test("getAllTabbable", () => {
  const initialInnerHTML = document.body.innerHTML;
  document.body.innerHTML = `
    <div id="container">
      <input id="input" />
      <input id="inputNegativeTabIndex" tabindex="-1" />
      <input id="inputZeroTabIndex" tabindex="0" />
      <input id="inputPositiveTabIndex" tabindex="1" />
    </div>
  `;
  const input = getById("input");
  const inputZeroTabIndex = getById("inputZeroTabIndex");
  const inputPositiveTabIndex = getById("inputPositiveTabIndex");

  // Mock matches and isVisible to mock isFocusable.
  // isFocusable true
  mockDom.matches.mockReturnValue(true);
  mockDom.isVisible.mockReturnValue(true);

  expect(getAllTabbable()).toEqual([
    input,
    inputZeroTabIndex,
    inputPositiveTabIndex,
  ]);
  expect(getAllTabbable(true)).toEqual([
    input,
    inputZeroTabIndex,
    inputPositiveTabIndex,
  ]);

  mockDom.matches.mockRestore();
  mockDom.isVisible.mockRestore();
  document.body.innerHTML = initialInnerHTML;
});

test("getFirstTabbableIn", () => {
  const initialInnerHTML = document.body.innerHTML;
  document.body.innerHTML = `
    <div id="container">
      <input id="input" />
      <input id="inputNegativeTabIndex" tabindex="-1" />
      <input id="inputZeroTabIndex" tabindex="0" />
      <input id="inputPositiveTabIndex" tabindex="1" />
    </div>
  `;
  const container = getById("container");
  const input = getById("input");

  // Mock matches and isVisible to mock isFocusable.
  // isFocusable true
  mockDom.matches.mockReturnValue(true);
  mockDom.isVisible.mockReturnValue(true);

  expect(getFirstTabbableIn(container)).toBe(input);
  expect(getFirstTabbableIn(container, true)).toBe(container);

  expect(getFirstTabbableIn(container, true, true)).toBe(container);
  expect(getFirstTabbableIn(container, false, true)).toBe(input);

  mockDom.matches.mockRestore();
  mockDom.isVisible.mockRestore();
  document.body.innerHTML = initialInnerHTML;
});

test("getFirstTabbable", () => {
  const initialInnerHTML = document.body.innerHTML;
  document.body.innerHTML = `
    <div id="container">
      <input id="input" />
      <input id="inputNegativeTabIndex" tabindex="-1" />
      <input id="inputZeroTabIndex" tabindex="0" />
      <input id="inputPositiveTabIndex" tabindex="1" />
    </div>
  `;
  const input = getById("input");

  // Mock matches and isVisible to mock isFocusable.
  // isFocusable true
  mockDom.matches.mockReturnValue(true);
  mockDom.isVisible.mockReturnValue(true);

  expect(getFirstTabbable()).toBe(input);
  expect(getFirstTabbable(true)).toBe(input);

  mockDom.matches.mockRestore();
  mockDom.isVisible.mockRestore();
  document.body.innerHTML = initialInnerHTML;
});

test("getLastTabbableIn", () => {
  const initialInnerHTML = document.body.innerHTML;
  document.body.innerHTML = `
    <div id="container">
      <input id="input" />
      <input id="inputNegativeTabIndex" tabindex="-1" />
      <input id="inputZeroTabIndex" tabindex="0" />
      <input id="inputPositiveTabIndex" tabindex="1" />
    </div>
  `;
  const container = getById("container");
  const inputPositiveTabIndex = getById("inputPositiveTabIndex");

  // Mock matches and isVisible to mock isFocusable.
  // isFocusable true
  mockDom.matches.mockReturnValue(true);
  mockDom.isVisible.mockReturnValue(true);

  expect(getLastTabbableIn(container)).toBe(inputPositiveTabIndex);
  expect(getLastTabbableIn(container, true)).toBe(inputPositiveTabIndex);
  expect(getLastTabbableIn(container, true, true)).toBe(inputPositiveTabIndex);
  expect(getLastTabbableIn(container, false, true)).toBe(inputPositiveTabIndex);
  expect(getLastTabbableIn(container, true, false)).toBe(inputPositiveTabIndex);

  mockDom.matches.mockRestore();
  mockDom.isVisible.mockRestore();
  document.body.innerHTML = initialInnerHTML;
});

test("getLastTabbable", () => {
  const initialInnerHTML = document.body.innerHTML;
  document.body.innerHTML = `
    <div id="container">
      <input id="input" />
      <input id="inputNegativeTabIndex" tabindex="-1" />
      <input id="inputZeroTabIndex" tabindex="0" />
      <input id="inputPositiveTabIndex" tabindex="1" />
    </div>
  `;
  const inputPositiveTabIndex = getById("inputPositiveTabIndex");

  // Mock matches and isVisible to mock isFocusable.
  // isFocusable true
  mockDom.matches.mockReturnValue(true);
  mockDom.isVisible.mockReturnValue(true);

  expect(getLastTabbable()).toBe(inputPositiveTabIndex);
  expect(getLastTabbable(true)).toBe(inputPositiveTabIndex);

  mockDom.matches.mockRestore();
  mockDom.isVisible.mockRestore();
  document.body.innerHTML = initialInnerHTML;
});

test("getNextTabbableIn", () => {
  const initialInnerHTML = document.body.innerHTML;
  document.body.innerHTML = `
    <div id="container">
      <input id="input" />
      <input id="inputNegativeTabIndex" tabindex="-1" />
      <input id="inputZeroTabIndex" tabindex="0" />
      <input id="inputPositiveTabIndex" tabindex="1" />
    </div>
  `;
  const container = getById("container");
  const input = getById("input");

  // Mock matches and isVisible to mock isFocusable.
  // isFocusable true
  mockDom.matches.mockReturnValue(true);
  mockDom.isVisible.mockReturnValue(true);

  expect(getNextTabbableIn(container)).toBe(input);
  expect(getNextTabbableIn(container, true)).toBe(container);
  expect(getNextTabbableIn(container, true, true)).toBe(container);
  expect(getNextTabbableIn(container, true, true, true)).toBe(container);
  expect(getNextTabbableIn(container, false, true)).toBe(input);
  expect(getNextTabbableIn(container, false, true, true)).toBe(input);
  expect(getNextTabbableIn(input)).toBe(null);

  mockDom.matches.mockRestore();
  mockDom.isVisible.mockRestore();
  document.body.innerHTML = initialInnerHTML;
});

test("getNextTabbable", () => {
  const initialInnerHTML = document.body.innerHTML;
  document.body.innerHTML = `
    <div id="container">
      <input id="input" />
      <input id="inputNegativeTabIndex" tabindex="-1" />
      <input id="inputZeroTabIndex" tabindex="0" />
      <input id="inputPositiveTabIndex" tabindex="1" />
    </div>
  `;
  const input = getById("input");

  // Mock matches and isVisible to mock isFocusable.
  // isFocusable true
  mockDom.matches.mockReturnValue(true);
  mockDom.isVisible.mockReturnValue(true);

  expect(getNextTabbable()).toBe(input);
  expect(getNextTabbable(true)).toBe(input);

  mockDom.matches.mockRestore();
  mockDom.isVisible.mockRestore();
  document.body.innerHTML = initialInnerHTML;
});

test("getPreviousTabbableIn", () => {
  const initialInnerHTML = document.body.innerHTML;
  document.body.innerHTML = `
    <div id="container">
      <input id="input" />
      <input id="inputNegativeTabIndex" tabindex="-1" />
      <input id="inputZeroTabIndex" tabindex="0" />
      <input id="inputPositiveTabIndex" tabindex="1" />
    </div>
  `;
  const container = getById("container");
  const inputPositiveTabIndex = getById("inputPositiveTabIndex");

  // Mock matches and isVisible to mock isFocusable.
  // isFocusable true
  mockDom.matches.mockReturnValue(true);
  mockDom.isVisible.mockReturnValue(true);

  expect(getPreviousTabbableIn(container)).toBe(inputPositiveTabIndex);
  expect(getPreviousTabbableIn(container, true)).toBe(inputPositiveTabIndex);
  expect(getPreviousTabbableIn(container, true, true)).toBe(
    inputPositiveTabIndex
  );
  expect(getPreviousTabbableIn(container, true, true, true)).toBe(
    inputPositiveTabIndex
  );
  expect(getPreviousTabbableIn(container, false, true)).toBe(
    inputPositiveTabIndex
  );
  expect(getPreviousTabbableIn(container, false, true, true)).toBe(
    inputPositiveTabIndex
  );

  mockDom.matches.mockRestore();
  mockDom.isVisible.mockRestore();
  document.body.innerHTML = initialInnerHTML;
});

test("getPreviousTabbable", () => {
  const initialInnerHTML = document.body.innerHTML;
  document.body.innerHTML = `
    <div id="container">
      <input id="input" />
      <input id="inputNegativeTabIndex" tabindex="-1" />
      <input id="inputZeroTabIndex" tabindex="0" />
      <input id="inputPositiveTabIndex" tabindex="1" />
    </div>
  `;
  const inputPositiveTabIndex = getById("inputPositiveTabIndex");

  // Mock matches and isVisible to mock isFocusable.
  // isFocusable true
  mockDom.matches.mockReturnValue(true);
  mockDom.isVisible.mockReturnValue(true);

  expect(getPreviousTabbable()).toBe(inputPositiveTabIndex);
  expect(getPreviousTabbable(true)).toBe(inputPositiveTabIndex);

  mockDom.matches.mockRestore();
  mockDom.isVisible.mockRestore();
  document.body.innerHTML = initialInnerHTML;
});

test("getClosestFocusable", () => {
  const initialInnerHTML = document.body.innerHTML;
  document.body.innerHTML = `
    <div id="container">
      <input id="input" />
      <input id="inputNegativeTabIndex" tabindex="-1" />
      <input id="inputZeroTabIndex" tabindex="0" />
      <input id="inputPositiveTabIndex" tabindex="1" />
    </div>
  `;
  const container = getById("container");
  const input = getById("input");

  // Mock matches and isVisible to mock isFocusable.
  // isFocusable true
  mockDom.matches.mockReturnValue(true);
  mockDom.isVisible.mockReturnValue(true);

  expect(getClosestFocusable(container)).toBe(container);
  expect(getClosestFocusable(input)).toBe(input);

  // isFocusable false
  mockDom.matches.mockReturnValue(false);
  mockDom.isVisible.mockReturnValue(false);
  expect(getClosestFocusable(container)).toBe(null);
  expect(getClosestFocusable(input)).toBe(null);

  mockDom.matches.mockRestore();
  mockDom.isVisible.mockRestore();
  document.body.innerHTML = initialInnerHTML;
});

test("hasFocus", () => {
  // In this test, we are mocking getActiveElement because it is a
  // mocked by our jest.mock("../dom"); at the top of this file.
  // This results in the function always returning undefined if it isn't mocked.

  const initialInnerHTML = document.body.innerHTML;
  document.body.innerHTML = `
    <div id="testNode">
      <input id="testInput" />
      <input type="text" aria-activedescendant="cb1-opt6" aria-readonly="true" aria-owns="cb1-list" aria-autocomplete="list" role="combobox" id="cb1-edit"/>
      <ul aria-expanded="true" role="listbox" id="cb1-list">
        <li role="option" id="cb1-opt1">Alabama</li>
        <li role="option" id="cb1-opt2">Alaska</li>
        <li role="option" id="cb1-opt3">American Samoa</li>
        <li role="option" id="cb1-opt4">Arizona</li>
        <li role="option" id="cb1-opt5">Arkansas</li>
        <li role="option" id="cb1-opt6">California</li>
        <li role="option" id="cb1-opt7">Colorado</li>
      </ul>
    </div>
  `;
  const node = getById("testNode");

  // Test before any elemeted is focused
  mockDom.getActiveElement.mockReturnValue(null);
  expect(hasFocus(node)).toBe(false);

  // Test with an element focused
  const input = getById("testInput");
  mockDom.getActiveElement.mockReturnValue(input);

  expect(hasFocus(node)).toBe(false);
  expect(hasFocus(input)).toBe(true);

  const input2 = getById("cb1-edit");
  mockDom.getActiveElement.mockReturnValue(input2);

  expect(hasFocus(node)).toBe(false);
  expect(hasFocus(input)).toBe(false);
  expect(hasFocus(input2)).toBe(true);

  const focusedLi = getById("cb1-opt6");
  mockDom.getActiveElement.mockReturnValue(focusedLi);
  expect(hasFocus(node)).toBe(false);
  expect(hasFocus(input)).toBe(false);
  expect(hasFocus(input2)).toBe(false);
  expect(hasFocus(focusedLi)).toBe(true);

  document.body.innerHTML = initialInnerHTML;
  mockDom.getActiveElement.mockRestore();
});

test("hasFocusWithin", () => {
  // In this test, we are mocking getActiveElement because it is a
  // mocked by our jest.mock("../dom"); at the top of this file.
  // This results in the function always returning undefined if it isn't mocked.

  const initialInnerHTML = document.body.innerHTML;
  document.body.innerHTML = `
    <div class="testDivClass">
      <div id="testNode">
        <input id="testInput" />
        <input type="text" aria-activedescendant="cb1-opt6" aria-readonly="true" aria-owns="cb1-list" aria-autocomplete="list" role="combobox" id="cb1-edit"/>
        <ul aria-expanded="true" role="listbox" id="cb1-list">
          <li role="option" id="cb1-opt1">Alabama</li>
          <li role="option" id="cb1-opt2">Alaska</li>
          <li role="option" id="cb1-opt3">American Samoa</li>
          <li role="option" id="cb1-opt4">Arizona</li>
          <li role="option" id="cb1-opt5">Arkansas</li>
          <li role="option" id="cb1-opt6">California</li>
          <li role="option" id="cb1-opt7">Colorado</li>
        </ul>
      </div>
    </div>
  `;
  const node = getById("testNode");

  // No active element
  mockDom.getActiveElement.mockReturnValue(null);
  expect(hasFocusWithin(node)).toBe(false);

  // Input as active element and node containing the input
  const input = getById("testInput");
  mockDom.getActiveElement.mockReturnValue(input);
  mockDom.contains.mockReturnValue(true);
  expect(hasFocusWithin(node)).toBe(true);

  // Input without aria-activedescendant as active element and node not containing the input
  mockDom.contains.mockReturnValue(false);
  expect(hasFocusWithin(node)).toBe(false);

  // Input with aria-activedescendant as active element and node not containing the input
  //  and element doens't have an id
  const divWithTestId = document.getElementsByClassName("testDivClass")[0]!;

  const input2 = getById("cb1-edit");
  mockDom.getActiveElement.mockReturnValue(input2);
  mockDom.contains.mockReturnValue(false);
  expect(hasFocusWithin(divWithTestId)).toBe(true);

  document.body.innerHTML = initialInnerHTML;
  mockDom.getActiveElement.mockRestore();
  mockDom.contains.mockRestore();
});

test("focusIfNeeded", () => {
  const initialInnerHTML = document.body.innerHTML;
  document.body.innerHTML = `
    <input id="testInput" />
  `;
  const input = getById("testInput");

  // Test with no element focused
  expect(document.activeElement === input).toBe(false);

  // Test with an element focused
  // Mock to have isFocusable return true
  mockDom.matches.mockReturnValue(true);
  mockDom.isVisible.mockReturnValue(true);

  focusIfNeeded(input);
  expect(document.activeElement === input).toBe(true);

  document.body.innerHTML = initialInnerHTML;
  mockDom.matches.mockRestore();
  mockDom.isVisible.mockRestore();
});

test("disableFocus", () => {
  const initialInnerHTML = document.body.innerHTML;
  document.body.innerHTML = `
    <input id="testInput" tabindex="1" />
  `;
  const input = getById("testInput");

  expect(input.getAttribute("data-tabindex")).toBe(null);
  expect(input.getAttribute("tabindex")).toBe("1");
  disableFocus(input);
  expect(input.getAttribute("data-tabindex")).toBe("1");
  expect(input.getAttribute("tabindex")).toBe("-1");

  document.body.innerHTML = initialInnerHTML;
});

test("disableFocusIn", () => {
  const initialInnerHTML = document.body.innerHTML;
  document.body.innerHTML = `
    <div id="testDiv">
      <input id="testInput" tabindex="1" />
    </div>
  `;
  const div = getById("testDiv");
  const input = getById("testInput");

  // Mock to make isTabbable true
  mockDom.matches.mockReturnValue(true);
  mockDom.isVisible.mockReturnValue(true);

  expect(input.getAttribute("data-tabindex")).toBe(null);
  expect(input.getAttribute("tabindex")).toBe("1");
  disableFocusIn(div);
  expect(input.getAttribute("data-tabindex")).toBe("1");
  expect(input.getAttribute("tabindex")).toBe("-1");

  document.body.innerHTML = initialInnerHTML;
  mockDom.matches.mockRestore();
  mockDom.isVisible.mockRestore();
});

test("restoreFocusIn", () => {
  const initialInnerHTML = document.body.innerHTML;
  document.body.innerHTML = `
    <div id="testDiv">
      <input id="testInput" tabindex="1" />
      <input id="testInput2" />
    </div>
  `;
  const div = getById("testDiv");
  const input = getById("testInput");
  const input2 = getById("testInput2");

  // Mock to make isTabbable true
  mockDom.matches.mockReturnValue(true);
  mockDom.isVisible.mockReturnValue(true);

  // No container data tab index
  expect(input.getAttribute("data-tabindex")).toBe(null);
  expect(input.getAttribute("tabindex")).toBe("1");
  expect(input2.getAttribute("data-tabindex")).toBe(null);
  expect(input2.getAttribute("tabindex")).toBe(null);
  disableFocus(input);
  disableFocus(input2);
  expect(input.getAttribute("data-tabindex")).toBe("1");
  expect(input.getAttribute("tabindex")).toBe("-1");
  expect(input2.getAttribute("data-tabindex")).toBe("");
  expect(input2.getAttribute("tabindex")).toBe("-1");
  restoreFocusIn(div);
  expect(input.getAttribute("data-tabindex")).toBe(null);
  expect(input.getAttribute("tabindex")).toBe("1");
  expect(input2.getAttribute("data-tabindex")).toBe(null);
  expect(input2.getAttribute("tabindex")).toBe(null);

  // Container data tab index
  div.setAttribute("data-tabindex", "2");
  restoreFocusIn(div);
  expect(div.getAttribute("tabindex")).toBe("2");

  document.body.innerHTML = initialInnerHTML;
  mockDom.matches.mockRestore();
  mockDom.isVisible.mockRestore();
});

test("ensureFocus", () => {
  const initialInnerHTML = document.body.innerHTML;
  document.body.innerHTML = `
    <input id="testInput" />
  `;
  const input = getById("testInput");
  const rafSpy = jest
    .spyOn(window, "requestAnimationFrame")
    .mockImplementation((cb) => {
      setTimeout(() => cb(0));
      return 0;
    });

  expect(document.activeElement === input).toBe(false);
  ensureFocus(input);
  expect(document.activeElement === input).toBe(true);
  input.blur();
  // isActive -> false
  const focusSpy = jest.spyOn(input, "focus");

  jest.useFakeTimers();
  expect(document.activeElement === input).toBe(false);
  ensureFocus(input, { isActive: () => false });
  expect(document.activeElement === input).toBe(true);

  jest.advanceTimersByTime(1000);

  expect(focusSpy).toHaveBeenCalledTimes(2);

  jest.useRealTimers();

  document.body.innerHTML = initialInnerHTML;
  rafSpy.mockRestore();
  focusSpy.mockRestore();
});
