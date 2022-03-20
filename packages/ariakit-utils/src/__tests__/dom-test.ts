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

test("getDocument", () => {
  const initialInnerHTML = document.body.innerHTML;
  document.body.innerHTML = '<div id="testNode"></div>';
  const node = document.getElementById("testNode");

  expect(getDocument(undefined)).toEqual(document);
  expect(getDocument(null)).toEqual(document);
  expect(getDocument(node)).toEqual(document);

  // Reset
  document.body.innerHTML = initialInnerHTML;
});

test("getWindow", () => {
  const initialInnerHTML = document.body.innerHTML;
  document.body.innerHTML = '<div id="testNode"></div>';
  const node = document.getElementById("testNode");

  expect(getWindow(undefined)).toEqual(window);
  expect(getWindow(null)).toEqual(window);
  expect(getWindow(node)).toEqual(window);

  // Reset
  document.body.innerHTML = initialInnerHTML;
});

test("getActiveElement", () => {
  const initialInnerHTML = document.body.innerHTML;
  document.body.innerHTML = `<div id="testNode">
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
  </div>`;
  const node = document.getElementById("testNode");

  // Test before any elemeted is focused
  expect(getActiveElement(undefined)).toEqual(document.body);
  expect(getActiveElement(null)).toEqual(document.body);
  expect(getActiveElement(node)).toEqual(document.body);

  // Test with an element focused
  const input = document.getElementById("testInput");
  input?.focus();

  expect(getActiveElement(undefined)).toEqual(input);
  expect(getActiveElement(null)).toEqual(input);
  expect(getActiveElement(node)).toEqual(input);
  expect(getActiveElement(input)).toEqual(input);

  // Test IE11 Case
  const activeElementMock = jest
    .spyOn(document, "activeElement", "get")
    .mockReturnValue(null);

  expect(getActiveElement(undefined)).toEqual(null);
  expect(getActiveElement(null)).toEqual(null);
  expect(getActiveElement(node)).toEqual(null);
  expect(getActiveElement(input)).toEqual(null);

  activeElementMock.mockRestore();

  // TODO: Not sure how to test the iframe case
  //  One option might be mocking isFrame and activeElement

  // activeDecendant = true
  const input2 = document.getElementById("cb1-edit");
  input2?.focus();

  const focusedLi = document.getElementById("cb1-opt6");

  expect(getActiveElement(undefined, true)).toEqual(focusedLi);
  expect(getActiveElement(null, true)).toEqual(focusedLi);
  expect(getActiveElement(node, true)).toEqual(focusedLi);
  expect(getActiveElement(input, true)).toEqual(focusedLi);
  expect(getActiveElement(input2, true)).toEqual(focusedLi);

  // Reset
  document.body.innerHTML = initialInnerHTML;
});

test("contains", () => {
  const initialInnerHTML = document.body.innerHTML;
  document.body.innerHTML =
    '<div id="testNode"><div id="innerTestNode" /></div>';
  const node = document.getElementById("testNode") as HTMLElement;
  const innerNode = document.getElementById("innerTestNode") as HTMLElement;

  expect(contains(node, node)).toEqual(true);
  expect(contains(node, innerNode)).toEqual(true);
  expect(contains(innerNode, node)).toEqual(false);

  // Operates the same as default `conatins`
  expect(contains(node, node)).toEqual(node.contains(node));
  expect(contains(node, innerNode)).toEqual(node.contains(innerNode));
  expect(contains(innerNode, node)).toEqual(innerNode.contains(node));

  // Reset
  document.body.innerHTML = initialInnerHTML;
});

test("isFrame", () => {
  const initialInnerHTML = document.body.innerHTML;
  document.body.innerHTML =
    '<div id="testNode"><iframe id="testIframe"/></div>';
  const node = document.getElementById("testNode") as HTMLElement;
  const iframe = document.getElementById("testIframe") as HTMLIFrameElement;

  expect(isFrame(node)).toEqual(false);
  expect(isFrame(iframe)).toEqual(true);

  // Reset
  document.body.innerHTML = initialInnerHTML;
});

test("isButton", () => {
  const initialInnerHTML = document.body.innerHTML;
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
  const node = document.getElementById("testNode") as HTMLElement;
  const button = document.getElementById("testButton") as HTMLButtonElement;
  const inputButton = document.getElementById(
    "testInputButton"
  ) as HTMLInputElement;
  const inputSubmit = document.getElementById(
    "testInputSubmit"
  ) as HTMLInputElement;
  const inputReset = document.getElementById(
    "testInputReset"
  ) as HTMLInputElement;
  const inputImage = document.getElementById(
    "testInputImage"
  ) as HTMLInputElement;
  const inputFile = document.getElementById(
    "testInputFile"
  ) as HTMLInputElement;
  const inputColor = document.getElementById(
    "testInputColor"
  ) as HTMLInputElement;
  const input = document.getElementById("testInput") as HTMLInputElement;
  const divButton = document.getElementById(
    "testDivButton"
  ) as HTMLButtonElement;

  expect(isButton(node)).toEqual(false);
  expect(isButton(button)).toEqual(true);
  expect(isButton(inputButton)).toEqual(true);
  expect(isButton(inputSubmit)).toEqual(true);
  expect(isButton(inputReset)).toEqual(true);
  expect(isButton(inputImage)).toEqual(true);
  expect(isButton(inputFile)).toEqual(true);
  expect(isButton(inputColor)).toEqual(true);
  expect(isButton(input)).toEqual(false);
  expect(isButton(divButton)).toEqual(false);

  // Reset
  document.body.innerHTML = initialInnerHTML;
});

test("matches", () => {
  const initialInnerHTML = document.body.innerHTML;
  document.body.innerHTML = '<div id="testNode" />';
  const element = document.getElementById("testNode") as HTMLElement;

  expect(matches(element, "div")).toEqual(true);

  // Unsure of a better way to test this
  // My current method is to create fake element with specific properties
  // matches
  const matchesFunc = jest.fn(() => true);
  const fakeElement = { matches: matchesFunc } as any;
  expect(matches(fakeElement, "div")).toEqual(true);
  expect(matchesFunc).toHaveBeenCalled();

  // msMatchesSelector
  const msMatchesSelector = jest.fn(() => true);
  const fakeElement2 = { msMatchesSelector } as any;
  expect(matches(fakeElement2, "div")).toEqual(true);
  expect(msMatchesSelector).toHaveBeenCalled();

  // webkitMatchesSelector
  const webkitMatchesSelector = jest.fn(() => true);
  const fakeElement3 = { webkitMatchesSelector } as any;
  expect(matches(fakeElement3, "div")).toEqual(true);
  expect(webkitMatchesSelector).toHaveBeenCalled();

  // Reset
  document.body.innerHTML = initialInnerHTML;
});

test("isVisible", () => {
  // Have to fake the offset* properties because they are not supported in jsdom
  const originalOffsetHeight =
    Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetHeight") ??
    {};
  const originalOffsetWidth =
    Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetWidth") ?? {};

  const initialInnerHTML = document.body.innerHTML;
  document.body.innerHTML = '<div id="testNode" />';
  const element = document.getElementById("testNode") as HTMLElement;

  // Tests the case with no offset* properties or getClientRects
  expect(isVisible(element)).toEqual(false);

  // Tests the case with offsetHeight
  Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
    configurable: true,
    value: 200,
  });
  expect(isVisible(element)).toEqual(true);
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
  expect(isVisible(element)).toEqual(true);
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
  expect(isVisible(element)).toEqual(true);
  element.getClientRects = originalGetClientRects;

  // Check that things were reset correctly
  expect(isVisible(element)).toEqual(false);

  // Reset
  document.body.innerHTML = initialInnerHTML;
});

test("closest", () => {
  const initialInnerHTML = document.body.innerHTML;
  document.body.innerHTML =
    '<div id="testNode"><div id="testNode2" /><input /></div>';
  const element = document.getElementById("testNode") as HTMLElement;
  const element2 = document.getElementById("testNode2") as HTMLElement;
  const input = document.getElementsByTagName("input")[0] as HTMLInputElement;

  expect(closest(element, "div")).toEqual(element);
  expect(closest(input, "div")).toEqual(element2);
  expect(closest(element2, "#testNode")).toEqual(element);

  // Fake object with no matches
  const fakeElement = {
    matches: () => false,
    parentElement: null,
    parentNode: null,
  } as any;
  expect(closest(fakeElement, "div")).toEqual(null);

  // Reset
  document.body.innerHTML = initialInnerHTML;
});

test("isTextField", () => {
  const initialInnerHTML = document.body.innerHTML;
  document.body.innerHTML = `
    <div id="testNode"/>
    <input id="testInput" type="text" />
    <input id="testInput2" type="button" />
    <textarea id="testTextarea" />
  `;
  const div = document.getElementById("testNode") as HTMLElement;
  const input = document.getElementById("testInput") as HTMLInputElement;
  const input2 = document.getElementById("testInput2") as HTMLInputElement;
  const textarea = document.getElementById(
    "testTextarea"
  ) as HTMLTextAreaElement;

  expect(isTextField(div)).toEqual(false);
  expect(isTextField(input)).toEqual(true);
  expect(isTextField(input2)).toEqual(false);
  expect(isTextField(textarea)).toEqual(true);

  const selectionStartSpy = jest
    .spyOn(input, "selectionStart", "get")
    .mockImplementation(() => {
      throw new Error();
    });

  expect(isTextField(input)).toEqual(false);

  selectionStartSpy.mockRestore();

  // Reset
  document.body.innerHTML = initialInnerHTML;
});

test("getPopupRole", () => {
  const initialInnerHTML = document.body.innerHTML;
  document.body.innerHTML = `
    <div id="testNode" role="dialog" />
    <div id="testNode2" role="menu" />
    <div id="testNode3" role="listbox" />
    <div id="testNode4" role="tree" />
    <div id="testNode5" role="grid" />
    <div id="testNode6" role="unsupported" />
    <div id="testNode7" />
  `;
  const div = document.getElementById("testNode") as HTMLElement;
  const div2 = document.getElementById("testNode2") as HTMLElement;
  const div3 = document.getElementById("testNode3") as HTMLElement;
  const div4 = document.getElementById("testNode4") as HTMLElement;
  const div5 = document.getElementById("testNode5") as HTMLElement;
  const div6 = document.getElementById("testNode6") as HTMLElement;
  const div7 = document.getElementById("testNode7") as HTMLElement;

  expect(getPopupRole(div)).toEqual("dialog");
  expect(getPopupRole(div2)).toEqual("menu");
  expect(getPopupRole(div3)).toEqual("listbox");
  expect(getPopupRole(div4)).toEqual("tree");
  expect(getPopupRole(div5)).toEqual("grid");
  expect(getPopupRole(div6)).toEqual(undefined);
  expect(getPopupRole(div6, "dialog")).toEqual("dialog");
  expect(getPopupRole(div6, true)).toEqual(true);
  expect(getPopupRole(div7)).toEqual(undefined);
  expect(getPopupRole(div7, "dialog")).toEqual("dialog");

  // Reset
  document.body.innerHTML = initialInnerHTML;
});

test("getTextboxSelection", () => {
  const initialInnerHTML = document.body.innerHTML;
  document.body.innerHTML = `
    <input id="testInput" type="text" value="some text" />
    <div contenteditable="true" id="testContentEditable" />
  `;
  const input = document.getElementById("testInput") as HTMLInputElement;
  input.setSelectionRange(2, 5);
  expect(getTextboxSelection(input)).toEqual({
    start: 2,
    end: 5,
  });

  // TODO: Figure out how to test the contenteditable case
  // This https://github.com/jsdom/jsdom/issues/1670#issuecomment-267843544
  //  implies that maybe content editiable isn't well supported in jsdom

  // Reset
  document.body.innerHTML = initialInnerHTML;
});

test("scrollIntoViewIfNeeded", () => {
  // TODO: Figure out how to test this
  // Seems like JSDOM doesn't support scroll stuff because it doesn't really do the layout
  // https://github.com/jsdom/jsdom/issues/1695
  // It seems like maybe we could fake a bunch of functions but it might not have a lot of value anyways
  const initialInnerHTML = document.body.innerHTML;
  document.body.innerHTML = `
  <div id="testNode">
    <div id="testNode2" >
      <div id="testNode3" />
    </div>
  </div>
`;
  const div = document.getElementById("testNode") as HTMLElement;
  const div2 = document.getElementById("testNode2") as HTMLElement;
  const div3 = document.getElementById("testNode3") as HTMLElement;

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
  document.body.innerHTML = initialInnerHTML;
  Object.defineProperty(
    HTMLElement.prototype,
    "offsetWidth",
    originalScrollIntoView
  );
});

test("getScrollingElement", () => {
  const initialInnerHTML = document.body.innerHTML;
  document.body.innerHTML = `
    <div id="testNode">
      <div id="testNode2" >
        <div id="testNode3" />
      </div>
    </div>
  `;
  const div = document.getElementById("testNode") as HTMLElement;
  const div2 = document.getElementById("testNode2") as HTMLElement;
  const div3 = document.getElementById("testNode3") as HTMLElement;

  // Undefined element case
  expect(getScrollingElement()).toEqual(null);
  expect(getScrollingElement(undefined)).toEqual(null);
  expect(getScrollingElement(null)).toEqual(null);

  //
  // Falls back to body cases
  //
  expect(getScrollingElement(div)).toEqual(document.body);

  // Fake properties because jsdon doesn't support layout stuff
  const div2ClientHeightSpy = jest.spyOn(div2, "clientHeight", "get");
  const div2ScrollHeightSpy = jest.spyOn(div2, "scrollHeight", "get");

  // clientHeight is 0
  div2ClientHeightSpy.mockReturnValue(0);
  expect(getScrollingElement(div2)).toEqual(document.body);

  // clientHeight is > scrollHeight
  div2ClientHeightSpy.mockReturnValue(100);
  div2ScrollHeightSpy.mockReturnValue(50);
  expect(getScrollingElement(div2)).toEqual(document.body);

  // overflow is hidden or visible
  div2ClientHeightSpy.mockReturnValue(20);
  div2ScrollHeightSpy.mockReturnValue(50);
  div2.style.overflowY = "hidden";
  expect(getScrollingElement(div2)).toEqual(document.body);
  div2.style.overflowY = "visible";
  expect(getScrollingElement(div2)).toEqual(document.body);

  //
  // None body cases
  //
  div2ClientHeightSpy.mockReturnValue(20);
  div2ScrollHeightSpy.mockReturnValue(50);
  // overflow is scroll
  div2.style.overflowY = "scroll";
  expect(getScrollingElement(div2)).toEqual(div2);
  expect(getScrollingElement(div3)).toEqual(div2);

  // overflow is auto
  div2.style.overflowY = "auto";
  expect(getScrollingElement(div2)).toEqual(div2);
  expect(getScrollingElement(div3)).toEqual(div2);

  // Reset
  document.body.innerHTML = initialInnerHTML;
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
  const div = document.getElementById("testNode") as HTMLElement;
  const div2 = document.getElementById("testNode2") as HTMLElement;
  const div3 = document.getElementById("testNode3") as HTMLElement;

  // Falls back to body cases
  expect(isPartiallyHidden(div)).toEqual(false);

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
  expect(isPartiallyHidden(div2)).toEqual(true);
  expect(isPartiallyHidden(div3)).toEqual(false);

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
  expect(isPartiallyHidden(div2)).toEqual(true);
  expect(isPartiallyHidden(div3)).toEqual(false);

  // Reset
  document.body.innerHTML = "";
});
