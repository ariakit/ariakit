import "ariakit-test-utils/__mock-get-client-rects";

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

function getById<T extends HTMLElement = HTMLElement>(id: string) {
  return document.getElementById(id) as T;
}

test("isFocusable", () => {
  const initialInnerHTML = document.body.innerHTML;
  document.body.innerHTML = `
      <div id='div' />
      <input id="input" />
      <input id="inputNegativeTabIndex" tabindex="-1" />
      <input id="inputHidden" hidden />
      <input id="inputDisabled" disabled />
    `;
  const div = getById("div");
  const input = getById("input");
  const inputNegativeTabIndex = getById("inputNegativeTabIndex");
  const inputHidden = getById("inputHidden");
  const inputDisabled = getById("inputDisabled");

  expect(isFocusable(div)).toBe(false);
  expect(isFocusable(input)).toBe(true);
  expect(isFocusable(inputNegativeTabIndex)).toBe(true);
  expect(isFocusable(inputHidden)).toBe(false);
  expect(isFocusable(inputDisabled)).toBe(false);

  document.body.innerHTML = initialInnerHTML;
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

  expect(isTabbable(input)).toBe(true);
  expect(isTabbable(inputNegativeTabIndex)).toBe(false);
  expect(isTabbable(inputZeroTabIndex)).toBe(true);
  expect(isTabbable(inputPositiveTabIndex)).toBe(true);

  document.body.innerHTML = initialInnerHTML;
});

test("getAllFocusableIn", () => {
  const initialInnerHTML = document.body.innerHTML;
  document.body.innerHTML = `
    <div id="container" tabindex="0">
      <div id='subContainer'>
        <input id="input" />
        <input id="inputNegativeTabIndex" tabindex="-1" />
        <input id="inputZeroTabIndex" tabindex="0" />
        <input id="inputPositiveTabIndex" tabindex="1" />
      </div>
    </div>
  `;
  const container = getById("container");
  const subContainer = getById("subContainer");
  const input = getById("input");
  const inputNegativeTabIndex = getById("inputNegativeTabIndex");
  const inputZeroTabIndex = getById("inputZeroTabIndex");
  const inputPositiveTabIndex = getById("inputPositiveTabIndex");

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
  expect(getAllFocusableIn(subContainer, true)).toEqual([
    input,
    inputNegativeTabIndex,
    inputZeroTabIndex,
    inputPositiveTabIndex,
  ]);

  document.body.innerHTML = initialInnerHTML;
});

test("getAllFocusable", () => {
  const initialInnerHTML = document.body.innerHTML;
  document.body.innerHTML = `
    <div id="container" tabindex="0">
      <div id='subContainer'>
        <input id="input" />
        <input id="inputNegativeTabIndex" tabindex="-1" />
        <input id="inputZeroTabIndex" tabindex="0" />
        <input id="inputPositiveTabIndex" tabindex="1" />
      </div>
    </div>
  `;
  const container = getById("container");
  const input = getById("input");
  const inputNegativeTabIndex = getById("inputNegativeTabIndex");
  const inputZeroTabIndex = getById("inputZeroTabIndex");
  const inputPositiveTabIndex = getById("inputPositiveTabIndex");

  expect(getAllFocusable()).toEqual([
    container,
    input,
    inputNegativeTabIndex,
    inputZeroTabIndex,
    inputPositiveTabIndex,
  ]);
  expect(getAllFocusable(true)).toEqual([
    container,
    input,
    inputNegativeTabIndex,
    inputZeroTabIndex,
    inputPositiveTabIndex,
  ]);

  document.body.innerHTML = initialInnerHTML;
});

test("getFirstFocusableIn", () => {
  const initialInnerHTML = document.body.innerHTML;
  document.body.innerHTML = `
    <div id="container" tabindex="0">
      <div id='subContainer'>
        <input id="input" />
        <input id="inputNegativeTabIndex" tabindex="-1" />
        <input id="inputZeroTabIndex" tabindex="0" />
        <input id="inputPositiveTabIndex" tabindex="1" />
      </div>
    </div>
  `;
  const container = getById("container");
  const input = getById("input");

  expect(getFirstFocusableIn(container)).toBe(input);
  expect(getFirstFocusableIn(container, true)).toBe(container);

  document.body.innerHTML = initialInnerHTML;
});

test("getFirstFocusable", () => {
  const initialInnerHTML = document.body.innerHTML;
  document.body.innerHTML = `
    <div id="container" tabindex="0">
      <div id='subContainer'>
        <input id="input" />
        <input id="inputNegativeTabIndex" tabindex="-1" />
        <input id="inputZeroTabIndex" tabindex="0" />
        <input id="inputPositiveTabIndex" tabindex="1" />
      </div>
    </div>
  `;
  const container = getById("container");

  expect(getFirstFocusable()).toBe(container);
  expect(getFirstFocusable(true)).toBe(container);

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
    <div id="container2" tabindex="0" />
  `;
  const container = getById("container");
  const input = getById("input");
  const inputZeroTabIndex = getById("inputZeroTabIndex");
  const inputPositiveTabIndex = getById("inputPositiveTabIndex");
  const container2 = getById("container2");

  expect(getAllTabbableIn(container)).toEqual([
    input,
    inputZeroTabIndex,
    inputPositiveTabIndex,
  ]);
  expect(getAllTabbableIn(container, true)).toEqual([
    input,
    inputZeroTabIndex,
    inputPositiveTabIndex,
  ]);
  expect(getAllTabbableIn(container, true, true)).toEqual([
    input,
    inputZeroTabIndex,
    inputPositiveTabIndex,
  ]);

  expect(getAllTabbableIn(container2)).toEqual([]);
  expect(getAllTabbableIn(container2, true)).toEqual([container2]);
  expect(getAllTabbableIn(container2, false, true)).toEqual([]);

  document.body.innerHTML = initialInnerHTML;
});

test("getAllTabbable", () => {
  const initialInnerHTML = document.body.innerHTML;
  document.body.innerHTML = `
    <div id="container" tabindex="0">
      <input id="input" />
      <input id="inputNegativeTabIndex" tabindex="-1" />
      <input id="inputZeroTabIndex" tabindex="0" />
      <input id="inputPositiveTabIndex" tabindex="1" />
    </div>
  `;
  const container = getById("container");
  const input = getById("input");
  const inputZeroTabIndex = getById("inputZeroTabIndex");
  const inputPositiveTabIndex = getById("inputPositiveTabIndex");

  expect(getAllTabbable()).toEqual([
    container,
    input,
    inputZeroTabIndex,
    inputPositiveTabIndex,
  ]);
  expect(getAllTabbable(true)).toEqual([
    container,
    input,
    inputZeroTabIndex,
    inputPositiveTabIndex,
  ]);

  document.body.innerHTML = initialInnerHTML;
});

test("getFirstTabbableIn", () => {
  const initialInnerHTML = document.body.innerHTML;
  document.body.innerHTML = `
    <div id="container" tabindex="0">
      <input id="input" />
      <input id="inputNegativeTabIndex" tabindex="-1" />
      <input id="inputZeroTabIndex" tabindex="0" />
      <input id="inputPositiveTabIndex" tabindex="1" />
    </div>
  `;
  const container = getById("container");
  const input = getById("input");

  expect(getFirstTabbableIn(container)).toBe(input);
  expect(getFirstTabbableIn(container, true)).toBe(container);

  expect(getFirstTabbableIn(container, true, true)).toBe(container);
  expect(getFirstTabbableIn(container, false, true)).toBe(input);

  document.body.innerHTML = initialInnerHTML;
});

test("getFirstTabbable", () => {
  const initialInnerHTML = document.body.innerHTML;
  document.body.innerHTML = `
    <div id="container" tabindex="0">
      <input id="input" />
      <input id="inputNegativeTabIndex" tabindex="-1" />
      <input id="inputZeroTabIndex" tabindex="0" />
      <input id="inputPositiveTabIndex" tabindex="1" />
    </div>
  `;
  const container = getById("container");

  expect(getFirstTabbable()).toBe(container);
  expect(getFirstTabbable(true)).toBe(container);

  document.body.innerHTML = initialInnerHTML;
});

test("getLastTabbableIn", () => {
  const initialInnerHTML = document.body.innerHTML;
  document.body.innerHTML = `
    <div id="container" tabindex="0">
      <input id="input" />
      <input id="inputNegativeTabIndex" tabindex="-1" />
      <input id="inputZeroTabIndex" tabindex="0" />
      <input id="inputPositiveTabIndex" tabindex="1" />
    </div>
  `;
  const container = getById("container");
  const inputPositiveTabIndex = getById("inputPositiveTabIndex");

  expect(getLastTabbableIn(container)).toBe(inputPositiveTabIndex);
  expect(getLastTabbableIn(container, true)).toBe(inputPositiveTabIndex);
  expect(getLastTabbableIn(container, true, true)).toBe(inputPositiveTabIndex);
  expect(getLastTabbableIn(container, false, true)).toBe(inputPositiveTabIndex);
  expect(getLastTabbableIn(container, true, false)).toBe(inputPositiveTabIndex);

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

  expect(getLastTabbable()).toBe(inputPositiveTabIndex);
  expect(getLastTabbable(true)).toBe(inputPositiveTabIndex);

  document.body.innerHTML = initialInnerHTML;
});

test("getNextTabbableIn", () => {
  const initialInnerHTML = document.body.innerHTML;
  document.body.innerHTML = `
    <div id="container" tabindex="0">
      <input id="input" />
      <input id="inputNegativeTabIndex" tabindex="-1" />
      <input id="inputZeroTabIndex" tabindex="0" />
      <input id="inputPositiveTabIndex" tabindex="1" />
    </div>
  `;
  const container = getById("container");
  const input = getById("input");

  expect(getNextTabbableIn(container)).toBe(input);
  expect(getNextTabbableIn(container, true)).toBe(container);
  expect(getNextTabbableIn(container, true, true)).toBe(container);
  expect(getNextTabbableIn(container, true, true, true)).toBe(container);
  expect(getNextTabbableIn(container, false, true)).toBe(input);
  expect(getNextTabbableIn(container, false, true, true)).toBe(input);
  expect(getNextTabbableIn(input)).toBe(null);

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

  expect(getNextTabbable()).toBe(input);
  expect(getNextTabbable(true)).toBe(input);

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

  expect(getPreviousTabbable()).toBe(inputPositiveTabIndex);
  expect(getPreviousTabbable(true)).toBe(inputPositiveTabIndex);

  document.body.innerHTML = initialInnerHTML;
});

test("getClosestFocusable", () => {
  const initialInnerHTML = document.body.innerHTML;
  document.body.innerHTML = `
    <div id="container" tabindex="0">
      <input id="input" />
      <input id="inputDisabled" disabled />
    </div>
  `;
  const container = getById("container");
  const input = getById("input");
  const inputDisabled = getById("inputDisabled");

  expect(getClosestFocusable(container)).toBe(container);
  expect(getClosestFocusable(input)).toBe(input);
  expect(getClosestFocusable(inputDisabled)).toBe(container);

  document.body.innerHTML = initialInnerHTML;
});

test("hasFocus", () => {
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
  expect(hasFocus(node)).toBe(false);

  // Test with an element focused
  const input = getById("testInput");
  input.focus();

  expect(hasFocus(node)).toBe(false);
  expect(hasFocus(input)).toBe(true);

  const input2 = getById("cb1-edit");
  const focusedLi = getById("cb1-opt6");
  input2.focus();

  expect(hasFocus(node)).toBe(false);
  expect(hasFocus(input)).toBe(false);
  expect(hasFocus(input2)).toBe(true);
  expect(hasFocus(focusedLi)).toBe(true);

  document.body.innerHTML = initialInnerHTML;
});

test("hasFocusWithin", () => {
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
      <div id="testNode2" />
    </div>
  `;
  const node = getById("testNode");

  // No active element
  expect(hasFocusWithin(node)).toBe(false);

  // Input as active element and node containing the input
  const input = getById("testInput");
  input.focus();
  expect(hasFocusWithin(node)).toBe(true);

  // Input without aria-activedescendant as active element and node not containing the input
  const input2 = getById("cb1-edit");
  input2.focus();
  const node2 = getById("testNode2");
  expect(hasFocusWithin(node2)).toBe(false);

  // Input with aria-activedescendant as active element and node not containing the input
  //  and element doens't have an id
  const divWithTestId = document.getElementsByClassName("testDivClass")[0]!;
  expect(hasFocusWithin(divWithTestId)).toBe(true);

  document.body.innerHTML = initialInnerHTML;
});

test("focusIfNeeded", () => {
  const initialInnerHTML = document.body.innerHTML;
  document.body.innerHTML = `
    <input id="testInput" />
  `;
  const input = getById("testInput");

  // Test with no element focused
  expect(document.activeElement === input).toBe(false);
  focusIfNeeded(input);
  expect(document.activeElement === input).toBe(true);

  document.body.innerHTML = initialInnerHTML;
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

  expect(input.getAttribute("data-tabindex")).toBe(null);
  expect(input.getAttribute("tabindex")).toBe("1");
  disableFocusIn(div);
  expect(input.getAttribute("data-tabindex")).toBe("1");
  expect(input.getAttribute("tabindex")).toBe("-1");

  document.body.innerHTML = initialInnerHTML;
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
