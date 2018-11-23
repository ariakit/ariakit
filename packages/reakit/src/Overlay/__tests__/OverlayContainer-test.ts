import OverlayContainer from "../OverlayContainer";

const { initialState, actions: a } = OverlayContainer;

test("initialState", () => {
  expect(initialState).toEqual({ visible: false });
});

test("toggle", () => {
  expect(a.toggle()({ visible: false })).toEqual({
    visible: true
  });
  expect(a.toggle()({ visible: true })).toEqual({
    visible: false
  });
});

test("show", () => {
  expect(a.show()(initialState)).toEqual({
    visible: true
  });
});

test("hide", () => {
  expect(a.hide()(initialState)).toEqual({
    visible: false
  });
});
