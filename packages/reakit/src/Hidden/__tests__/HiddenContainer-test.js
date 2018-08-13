import { initialState, toggle, show, hide } from "../HiddenContainer";

test("initialState", () => {
  expect(initialState).toEqual({ visible: false });
});

test("toggle", () => {
  expect(toggle()({ visible: false })).toEqual({ visible: true });
  expect(toggle()({ visible: true })).toEqual({ visible: false });
});

test("show", () => {
  expect(show()()).toEqual({ visible: true });
});

test("hide", () => {
  expect(hide()()).toEqual({ visible: false });
});
