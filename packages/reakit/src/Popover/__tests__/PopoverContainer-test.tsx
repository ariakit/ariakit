import * as React from "react";
import { mount, ReactWrapper } from "enzyme";
import PopoverContainer from "../PopoverContainer";

// @ts-ignore
const Box = (props: any) => null;

const wrap = (Container: React.StatelessComponent<any>, props = {}) =>
  mount(
    <Container {...props}>
      {(popover: any) => <Box popover={popover} />}
    </Container>
  );

const getState = (wrapper: ReactWrapper) =>
  wrapper
    .update()
    .find(Box)
    .prop("popover");

const ensureState = (wrapper: ReactWrapper) => {
  const state = getState(wrapper);
  expect(state).toHaveProperty("popoverId", expect.any(String));
};

const createTests = (Container: React.StatelessComponent<any>) => {
  test("state", () => {
    ensureState(wrap(Container));
  });

  test("popoverId", () => {
    const wrapper = wrap(Container);
    expect(getState(wrapper).popoverId).toMatch(/^popover\d$/);
  });
};

describe("PopoverContainer", () => createTests(PopoverContainer));
