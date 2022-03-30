import {
  closest,
  contains,
  getActiveElement,
  getDocument,
  getPopupRole,
  getScrollingElement,
  getTextboxSelection,
  getWindow,
  isButton,
  isFrame,
  isPartiallyHidden,
  isTextField,
  isVisible,
  matches,
  scrollIntoViewIfNeeded,
} from "../dom";

function getById<T extends HTMLElement = HTMLElement>(id: string) {
  return document.getElementById(id) as T;
}

let initialInnerHTML = "";

beforeEach(() => {
  initialInnerHTML = document.body.innerHTML;
});

afterEach(() => {
  document.body.innerHTML = initialInnerHTML;
});

test("getDocument", () => {
  document.body.innerHTML = '<div id="testNode" />';
  const node = getById("testNode");

  expect(getDocument(undefined)).toBe(document);
  expect(getDocument(null)).toBe(document);
  expect(getDocument(node)).toBe(document);
});

test("getWindow", () => {
  document.body.innerHTML = '<div id="testNode" />';
  const node = getById("testNode");

  expect(getWindow(undefined)).toBe(window);
  expect(getWindow(null)).toBe(window);
  expect(getWindow(node)).toBe(window);
});

test("getActiveElement", () => {
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
  expect(getActiveElement(undefined)).toBe(document.body);
  expect(getActiveElement(null)).toBe(document.body);
  expect(getActiveElement(node)).toBe(document.body);

  // Test with an element focused
  const input = getById("testInput");
  input.focus();

  expect(getActiveElement(undefined)).toBe(input);
  expect(getActiveElement(null)).toBe(input);
  expect(getActiveElement(node)).toBe(input);
  expect(getActiveElement(input)).toBe(input);

  // Test IE11 Case
  const activeElementMock = jest
    .spyOn(document, "activeElement", "get")
    .mockReturnValue(null);

  expect(getActiveElement(undefined)).toBe(null);
  expect(getActiveElement(null)).toBe(null);
  expect(getActiveElement(node)).toBe(null);
  expect(getActiveElement(input)).toBe(null);

  activeElementMock.mockRestore();

  // activeDecendant = true
  const input2 = getById("cb1-edit");
  input2.focus();

  const focusedLi = getById("cb1-opt6");

  expect(getActiveElement(undefined, true)).toBe(focusedLi);
  expect(getActiveElement(null, true)).toBe(focusedLi);
  expect(getActiveElement(node, true)).toBe(focusedLi);
  expect(getActiveElement(input, true)).toBe(focusedLi);
  expect(getActiveElement(input2, true)).toBe(focusedLi);
});

test("contains", () => {
  document.body.innerHTML =
    '<div id="testNode"><div id="innerTestNode" /></div>';
  const node = getById("testNode");
  const innerNode = getById("innerTestNode");

  expect(contains(node, node)).toBe(true);
  expect(contains(node, innerNode)).toBe(true);
  expect(contains(innerNode, node)).toBe(false);

  // Operates the same as default `conatins`
  expect(contains(node, node)).toBe(node.contains(node));
  expect(contains(node, innerNode)).toBe(node.contains(innerNode));
  expect(contains(innerNode, node)).toBe(innerNode.contains(node));
});

test("isFrame", () => {
  document.body.innerHTML =
    '<div id="testNode"><iframe id="testIframe"/></div>';
  const node = getById("testNode");
  const iframe = getById("testIframe");

  expect(isFrame(node)).toBe(false);
  expect(isFrame(iframe)).toBe(true);
});

test("isButton", () => {
  document.body.innerHTML = `
    <div id="testNode">
      <button id="testButton"/>
      <input type="button" id="testInputButton"/>
      <input type="submit" id="testInputSubmit"/>
      <input type="reset" id="testInputReset"/>
      <input type="image" id="testInputImage"/>
      <input type="file" id="testInputFile"/>
      <input type="color" id="testInputColor"/>
      <input type="text" id="testInput"/>
      <div role="button" id="testDivButton"/>
    </div>
  `;
  const node = getById("testNode");
  const button = getById("testButton");
  const inputButton = getById("testInputButton");
  const inputSubmit = getById("testInputSubmit");
  const inputReset = getById("testInputReset");
  const inputImage = getById("testInputImage");
  const inputFile = getById("testInputFile");
  const inputColor = getById("testInputColor");
  const input = getById("testInput");
  const divButton = getById("testDivButton");

  expect(isButton(node)).toBe(false);
  expect(isButton(button)).toBe(true);
  expect(isButton(inputButton)).toBe(true);
  expect(isButton(inputSubmit)).toBe(true);
  expect(isButton(inputReset)).toBe(true);
  expect(isButton(inputImage)).toBe(true);
  expect(isButton(inputFile)).toBe(true);
  expect(isButton(inputColor)).toBe(true);
  expect(isButton(input)).toBe(false);
  expect(isButton(divButton)).toBe(false);
});

test("matches", () => {
  document.body.innerHTML = '<div id="testNode" />';
  const element = getById("testNode");

  expect(matches(element, "div")).toBe(true);

  // msMatchesSelector
  const msMatchesSelector = jest.fn(() => true);
  const fakeElement2 = { msMatchesSelector } as any;
  expect(matches(fakeElement2, "div")).toBe(true);
  expect(msMatchesSelector).toHaveBeenCalled();

  // webkitMatchesSelector
  const webkitMatchesSelector = jest.fn(() => true);
  const fakeElement3 = { webkitMatchesSelector } as any;
  expect(matches(fakeElement3, "div")).toBe(true);
  expect(webkitMatchesSelector).toHaveBeenCalled();
});

test("isVisible", () => {
  document.body.innerHTML = '<div id="testNode" />';
  const element = getById("testNode");

  // Have to fake the offset* properties because they are not supported in jsdom
  // Store the original values
  const originalOffsetHeight =
    Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetHeight") ??
    {};
  const originalOffsetWidth =
    Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetWidth") ?? {};

  // Tests the case with no offset* properties or getClientRects
  expect(isVisible(element)).toBe(false);

  // Tests the case with offsetHeight
  Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
    configurable: true,
    value: 200,
  });
  expect(isVisible(element)).toBe(true);
  Object.defineProperty(
    HTMLElement.prototype,
    "offsetHeight",
    originalOffsetHeight
  );

  // Tests the case with offsetWidth
  Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
    configurable: true,
    value: 200,
  });
  expect(isVisible(element)).toBe(true);
  Object.defineProperty(
    HTMLElement.prototype,
    "offsetWidth",
    originalOffsetWidth!
  );

  // Tests the case with getClientRects
  const originalGetClientRects = element.getClientRects;
  element.getClientRects = () =>
    // @ts-expect-error
    //  getClientRects is suppose to return a DOMRectList but there is no way to construct one
    //  So we just return an array with > 0 lengh
    ["some", "fake", "DOMRectList"];
  expect(isVisible(element)).toBe(true);
  element.getClientRects = originalGetClientRects;

  // Check that things were reset correctly
  expect(isVisible(element)).toBe(false);
});

test("closest", () => {
  document.body.innerHTML =
    '<div id="testNode"><div id="testNode2" /><input id="input" /></div>';
  const element = getById("testNode");
  const element2 = getById("testNode2");
  const input = getById("input");

  expect(closest(element, "div")).toBe(element);
  expect(closest(input, "div")).toBe(element2);
  expect(closest(element2, "#testNode")).toBe(element);

  // Fake object with no matches
  const fakeElement = {
    matches: () => false,
    parentElement: null,
    parentNode: null,
  } as any;
  expect(closest(fakeElement, "div")).toBe(null);
});

test("isTextField", () => {
  document.body.innerHTML = `
    <div id="testNode"/>
    <input id="testInput" type="text" />
    <input id="testInput2" type="button" />
    <textarea id="testTextarea" />
  `;
  const div = getById("testNode");
  const input = getById<HTMLInputElement>("testInput");
  const input2 = getById("testInput2");
  const textarea = getById("testTextarea");

  expect(isTextField(div)).toBe(false);
  expect(isTextField(input)).toBe(true);
  expect(isTextField(input2)).toBe(false);
  expect(isTextField(textarea)).toBe(true);

  const selectionStartSpy = jest
    .spyOn(input, "selectionStart", "get")
    .mockImplementation(() => {
      throw new Error();
    });

  expect(isTextField(input)).toBe(false);

  selectionStartSpy.mockRestore();
});

test("getPopupRole", () => {
  document.body.innerHTML = `
    <div id="testNode" role="dialog" />
    <div id="testNode2" role="menu" />
    <div id="testNode3" role="listbox" />
    <div id="testNode4" role="tree" />
    <div id="testNode5" role="grid" />
    <div id="testNode6" role="unsupported" />
    <div id="testNode7" />
  `;
  const div = getById("testNode");
  const div2 = getById("testNode2");
  const div3 = getById("testNode3");
  const div4 = getById("testNode4");
  const div5 = getById("testNode5");
  const div6 = getById("testNode6");
  const div7 = getById("testNode7");

  expect(getPopupRole(div)).toBe("dialog");
  expect(getPopupRole(div2)).toBe("menu");
  expect(getPopupRole(div3)).toBe("listbox");
  expect(getPopupRole(div4)).toBe("tree");
  expect(getPopupRole(div5)).toBe("grid");
  expect(getPopupRole(div6)).toBe(undefined);
  expect(getPopupRole(div6, "dialog")).toBe("dialog");
  expect(getPopupRole(div6, true)).toBe(true);
  expect(getPopupRole(div7)).toBe(undefined);
  expect(getPopupRole(div7, "dialog")).toBe("dialog");
});

test("getTextboxSelection", () => {
  document.body.innerHTML = `
    <input id="testInput" type="text" value="some text" />
    <div contenteditable="true" id="testContentEditable" />
  `;
  const input = getById<HTMLInputElement>("testInput");
  input.setSelectionRange(2, 5);
  expect(getTextboxSelection(input)).toEqual({
    start: 2,
    end: 5,
  });
});

test("scrollIntoViewIfNeeded", () => {
  document.body.innerHTML = `
    <div id="testNode">
      <div id="testNode2" >
        <div id="testNode3" />
      </div>
    </div>
  `;
  const div = getById("testNode");
  const div2 = getById("testNode2");
  const div3 = getById("testNode3");

  const scrollIntoViewMock = jest.fn();
  const originalScrollIntoView =
    Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollIntoView") ??
    {};
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
    configurable: true,
    value: scrollIntoViewMock,
  });
  scrollIntoViewIfNeeded(div);
  expect(scrollIntoViewMock).not.toHaveBeenCalled();

  const divGetBoundingClientRectSpy = jest.spyOn(div, "getBoundingClientRect");
  const div2GetBoundingClientRectSpy = jest.spyOn(
    div2,
    "getBoundingClientRect"
  );
  divGetBoundingClientRectSpy.mockReturnValue({
    height: 0,
    width: 0,
    x: 100,
    y: 100,
    top: 0,
    left: 0,
    right: 100,
    bottom: 100,
  } as DOMRect);
  div2GetBoundingClientRectSpy.mockReturnValue({
    height: 0,
    width: 0,
    x: 50,
    y: 50,
    top: 0,
    left: 0,
    right: 50,
    bottom: 50,
  } as DOMRect);

  scrollIntoViewIfNeeded(div2);
  expect(scrollIntoViewMock).toBeCalledTimes(1);
  scrollIntoViewIfNeeded(div3);
  expect(scrollIntoViewMock).toBeCalledTimes(1);

  // Reset
  Object.defineProperty(
    HTMLElement.prototype,
    "offsetWidth",
    originalScrollIntoView
  );
});

test("getScrollingElement", () => {
  document.body.innerHTML = `
    <div id="testNode">
      <div id="testNode2" >
        <div id="testNode3" />
      </div>
    </div>
  `;
  const div = getById("testNode");
  const div2 = getById("testNode2");
  const div3 = getById("testNode3");

  // Undefined element case
  expect(getScrollingElement()).toBe(null);
  expect(getScrollingElement(undefined)).toBe(null);
  expect(getScrollingElement(null)).toBe(null);

  //
  // Falls back to body cases
  //
  expect(getScrollingElement(div)).toBe(document.body);

  // Fake properties because jsdon doesn't support layout stuff
  const div2ClientHeightSpy = jest.spyOn(div2, "clientHeight", "get");
  const div2ScrollHeightSpy = jest.spyOn(div2, "scrollHeight", "get");

  // clientHeight is 0
  div2ClientHeightSpy.mockReturnValue(0);
  expect(getScrollingElement(div2)).toBe(document.body);

  // clientHeight is > scrollHeight
  div2ClientHeightSpy.mockReturnValue(100);
  div2ScrollHeightSpy.mockReturnValue(50);
  expect(getScrollingElement(div2)).toBe(document.body);

  // overflow is hidden or visible
  div2ClientHeightSpy.mockReturnValue(20);
  div2ScrollHeightSpy.mockReturnValue(50);
  div2.style.overflowY = "hidden";
  expect(getScrollingElement(div2)).toBe(document.body);
  div2.style.overflowY = "visible";
  expect(getScrollingElement(div2)).toBe(document.body);

  //
  // None body cases
  //
  div2ClientHeightSpy.mockReturnValue(20);
  div2ScrollHeightSpy.mockReturnValue(50);
  // overflow is scroll
  div2.style.overflowY = "scroll";
  expect(getScrollingElement(div2)).toBe(div2);
  expect(getScrollingElement(div3)).toBe(div2);

  // overflow is auto
  div2.style.overflowY = "auto";
  expect(getScrollingElement(div2)).toBe(div2);
  expect(getScrollingElement(div3)).toBe(div2);

  // Reset
  div2ClientHeightSpy.mockRestore();
  div2ScrollHeightSpy.mockRestore();
});

test("isPartiallyHidden", () => {
  document.body.innerHTML = `
    <div id="testNode">
      <div id="testNode2">
        <div id="testNode3" />
      </div>
    </div>
  `;
  const div = getById("testNode");
  const div2 = getById("testNode2");
  const div3 = getById("testNode3");

  // Falls back to body cases
  expect(isPartiallyHidden(div)).toBe(false);

  // Is visible case
  const divGetBoundingClientRectSpy = jest.spyOn(div, "getBoundingClientRect");
  const div2GetBoundingClientRectSpy = jest.spyOn(
    div2,
    "getBoundingClientRect"
  );
  divGetBoundingClientRectSpy.mockReturnValue({
    height: 0,
    width: 0,
    x: 100,
    y: 100,
    top: 0,
    left: 0,
    right: 100,
    bottom: 100,
  } as DOMRect);
  div2GetBoundingClientRectSpy.mockReturnValue({
    height: 0,
    width: 0,
    x: 50,
    y: 50,
    top: 0,
    left: 0,
    right: 50,
    bottom: 50,
  } as DOMRect);
  expect(isPartiallyHidden(div2)).toBe(true);
  expect(isPartiallyHidden(div3)).toBe(false);

  // Is hidden case
  divGetBoundingClientRectSpy.mockReturnValue({
    height: 0,
    width: 0,
    x: 100,
    y: 100,
    top: 0,
    left: 0,
    right: 100,
    bottom: 100,
  } as DOMRect);
  div2GetBoundingClientRectSpy.mockReturnValue({
    height: 0,
    width: 0,
    x: 50,
    y: 50,
    top: 0,
    left: 0,
    right: 200,
    bottom: 200,
  } as DOMRect);
  expect(isPartiallyHidden(div2)).toBe(true);
  expect(isPartiallyHidden(div3)).toBe(false);
});
