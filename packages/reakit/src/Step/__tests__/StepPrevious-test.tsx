import * as React from "react";
import { mount } from "enzyme";

import StepPrevious from "../StepPrevious";

it("calls previous on click", () => {
  const props = {
    previous: jest.fn()
  };
  const wrapper = mount(<StepPrevious {...props} />);
  expect(props.previous).toHaveBeenCalledTimes(0);
  wrapper.simulate("click");
  expect(props.previous).toHaveBeenCalledTimes(1);
});

it("calls previous and onClick on click", () => {
  const props = {
    previous: jest.fn(),
    onClick: jest.fn()
  };
  const wrapper = mount(<StepPrevious {...props} />);
  expect(props.previous).toHaveBeenCalledTimes(0);
  expect(props.onClick).toHaveBeenCalledTimes(0);
  wrapper.simulate("click");
  expect(props.previous).toHaveBeenCalledTimes(1);
  expect(props.onClick).toHaveBeenCalledTimes(1);
});
