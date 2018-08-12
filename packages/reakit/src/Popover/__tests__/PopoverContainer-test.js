import React from "react";
import { mount } from "enzyme";
import PopoverContainer from "../PopoverContainer";

const Base = () => null;

const wrap = (Container, props = {}) =>
  mount(
    // @ts-ignore
    <Container {...props}>{popover => <Base popover={popover} />}</Container>
  );

const getState = wrapper =>
  wrapper
    .update()
    .find(Base)
    .prop("popover");

const ensureState = wrapper => {
  const state = getState(wrapper);
  expect(state).toHaveProperty("popoverId", expect.any(String));
};

const createTests = Container => {
  test("state", () => {
    ensureState(wrap(Container));
  });

  test("popoverId", () => {
    const wrapper = wrap(Container);
    expect(getState(wrapper).popoverId).toMatch(/^popover\d$/);
  });
};

describe("PopoverContainer", () => createTests(PopoverContainer));
