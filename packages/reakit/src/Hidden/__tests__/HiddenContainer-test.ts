import HiddenContainer from "../HiddenContainer";
import callMeMaybe from "../../_utils/callMeMaybe";

const { initialState, actions: a } = HiddenContainer;

test("initialState", () => {
  expect(initialState).toEqual({ visible: false });
});

test("toggle", () => {
  expect(callMeMaybe(a.toggle(), { visible: false })).toEqual({
    visible: true
  });
  expect(callMeMaybe(a.toggle(), { visible: true })).toEqual({
    visible: false
  });
});

test("show", () => {
  expect(callMeMaybe(a.show(), initialState)).toEqual({
    visible: true
  });
});

test("hide", () => {
  expect(callMeMaybe(a.hide(), initialState)).toEqual({
    visible: false
  });
});
