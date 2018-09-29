import * as React from "react";
import { mount } from "enzyme";

import StepNext from "../StepNext";

it("calls next on click", () => {
  const props = {
    next: jest.fn()
  };
  const wrapper = mount(<StepNext {...props} />);
  expect(props.next).toHaveBeenCalledTimes(0);
  wrapper.simulate("click");
  expect(props.next).toHaveBeenCalledTimes(1);
});

it("calls next and onClick on click", () => {
  const props = {
    next: jest.fn(),
    onClick: jest.fn()
  };
  const wrapper = mount(<StepNext {...props} />);
  expect(props.next).toHaveBeenCalledTimes(0);
  expect(props.onClick).toHaveBeenCalledTimes(0);
  wrapper.simulate("click");
  expect(props.next).toHaveBeenCalledTimes(1);
  expect(props.onClick).toHaveBeenCalledTimes(1);
});

it("wrapper should be disabled", () => {
  const props = {
    next: jest.fn(),
    onClick: jest.fn(),
    loop: false,
    hasNext: jest.fn().mockReturnValue(false)
  };
  const wrapper = mount(<StepNext {...props} />);
  expect(wrapper.find("Box").props().disabled).toEqual(true);
});
