import React from "react";
import { mount } from "enzyme";
import PopoverContainer from "../PopoverContainer";

const Box = () => null;

const wrap = (Container, props = {}) =>
  mount(
    <Container {...props}>{popover => <Box popover={popover} />}</Container>
  );

const getState = wrapper =>
  wrapper
    .update()
    .find(Box)
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
