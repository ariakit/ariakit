import React from "react";
import { mount } from "enzyme";
import TabsContainer from "../TabsContainer";

const Base = () => null;

const wrap = (Container, props = {}) =>
  mount(<Container {...props}>{tabs => <Base tabs={tabs} />}</Container>);

const getState = wrapper =>
  wrapper
    .update()
    .find(Base)
    .prop("tabs");

const ensureState = wrapper => {
  const state = getState(wrapper);
  expect(state).toHaveProperty("loop", true);
  expect(state).toHaveProperty("current", 0);
};

const createTests = Container => {
  test("state", () => {
    ensureState(wrap(Container));
  });
};

describe("TabsContainer", () => createTests(TabsContainer));
