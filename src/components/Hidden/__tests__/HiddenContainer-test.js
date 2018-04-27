import React from "react";
import { mount } from "enzyme";
import HiddenContainer from "../HiddenContainer";

const Base = () => null;

const wrap = (Container, props = {}) =>
  mount(<Container {...props}>{hidden => <Base hidden={hidden} />}</Container>);

const getState = wrapper =>
  wrapper
    .update()
    .find(Base)
    .prop("hidden");

const initialState = {
  visible: false
};

const ensureState = wrapper => {
  const state = getState(wrapper);
  expect(state).toHaveProperty("visible", expect.any(Boolean));
  expect(state).toHaveProperty("toggle", expect.any(Function));
  expect(state).toHaveProperty("show", expect.any(Function));
  expect(state).toHaveProperty("hide", expect.any(Function));
};

const createTests = Container => {
  test("state", () => {
    ensureState(wrap(Container));
  });

  test("visible", () => {
    const wrapper = wrap(Container);
    expect(getState(wrapper).visible).toBe(initialState.visible);
  });

  test("initialState visible true", () => {
    const wrapper = wrap(Container, { initialState: { visible: true } });
    expect(getState(wrapper).visible).toBe(true);
  });

  test("initialState visible false", () => {
    const wrapper = wrap(Container, { initialState: { visible: false } });
    expect(getState(wrapper).visible).toBe(false);
  });

  test("toggle", () => {
    const wrapper = wrap(Container, { initialState: { visible: false } });
    getState(wrapper).toggle();
    expect(getState(wrapper).visible).toBe(true);
    getState(wrapper).toggle();
    expect(getState(wrapper).visible).toBe(false);
  });

  test("show", () => {
    const wrapper = wrap(Container, { initialState: { visible: false } });
    getState(wrapper).show();
    expect(getState(wrapper).visible).toBe(true);
    getState(wrapper).show();
    expect(getState(wrapper).visible).toBe(true);
  });

  test("hide", () => {
    const wrapper = wrap(Container, { initialState: { visible: true } });
    getState(wrapper).hide();
    expect(getState(wrapper).visible).toBe(false);
    getState(wrapper).hide();
    expect(getState(wrapper).visible).toBe(false);
  });
};

describe("HiddenContainer", () => createTests(HiddenContainer));
