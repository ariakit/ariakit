import { initialState, toggle, show, hide } from "../HiddenContainer";

test("initialState", () => {
  expect(initialState).toEqual({ visible: false });
});

test("toggle", () => {
  expect(toggle()({ visible: false })).toEqual({ visible: true });
  expect(toggle()({ visible: true })).toEqual({ visible: false });
});

test("show", () => {
  expect(show()({ visible: false })).toEqual({ visible: true });
  expect(show()({ visible: true })).toEqual({ visible: true });
});

test("hide", () => {
  expect(hide()({ visible: false })).toEqual({ visible: false });
  expect(hide()({ visible: true })).toEqual({ visible: false });
});
