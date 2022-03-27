import * as dom from "../dom";
import {
  getAllFocusable,
  getAllFocusableIn,
  getFirstFocusable,
  getFirstFocusableIn,
  isFocusable,
  isTabbable,
} from "../focus";

jest.mock("../dom");

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
  const input = document.getElementById("input") as HTMLInputElement;
  const inputNegativeTabIndex = document.getElementById(
    "inputNegativeTabIndex"
  ) as HTMLInputElement;
  const inputZeroTabIndex = document.getElementById(
    "inputZeroTabIndex"
  ) as HTMLInputElement;
  const inputPositiveTabIndex = document.getElementById(
    "inputPositiveTabIndex"
  ) as HTMLInputElement;

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
  const container = document.getElementById("container") as HTMLElement;
  const input = document.getElementById("input") as HTMLInputElement;
  const inputNegativeTabIndex = document.getElementById(
    "inputNegativeTabIndex"
  ) as HTMLInputElement;
  const inputZeroTabIndex = document.getElementById(
    "inputZeroTabIndex"
  ) as HTMLInputElement;
  const inputPositiveTabIndex = document.getElementById(
    "inputPositiveTabIndex"
  ) as HTMLInputElement;

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

  // TODO: Figure out how to test iframe with contentDocument

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
  const input = document.getElementById("input") as HTMLInputElement;
  const inputNegativeTabIndex = document.getElementById(
    "inputNegativeTabIndex"
  ) as HTMLInputElement;
  const inputZeroTabIndex = document.getElementById(
    "inputZeroTabIndex"
  ) as HTMLInputElement;
  const inputPositiveTabIndex = document.getElementById(
    "inputPositiveTabIndex"
  ) as HTMLInputElement;

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
  const container = document.getElementById("container") as HTMLElement;
  const input = document.getElementById("input") as HTMLInputElement;

  // Mock matches and isVisible to mock isFocusable.
  // isFocusable true
  mockDom.matches.mockReturnValue(true);
  mockDom.isVisible.mockReturnValue(true);

  expect(getFirstFocusableIn(container)).toEqual(input);
  expect(getFirstFocusableIn(container, true)).toEqual(container);

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
  const input = document.getElementById("input") as HTMLInputElement;

  // Mock matches and isVisible to mock isFocusable.
  // isFocusable true
  mockDom.matches.mockReturnValue(true);
  mockDom.isVisible.mockReturnValue(true);

  expect(getFirstFocusable()).toEqual(input);
  expect(getFirstFocusable(true)).toEqual(document.body);

  mockDom.matches.mockRestore();
  mockDom.isVisible.mockRestore();
  document.body.innerHTML = initialInnerHTML;
});
