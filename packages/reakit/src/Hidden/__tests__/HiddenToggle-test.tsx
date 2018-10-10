import * as React from "react";
import { mount } from "enzyme";
import HiddenToggle from "../HiddenToggle";

it("calls toggle on click", () => {
  const props = { toggle: jest.fn() };
  const wrapper = mount(<HiddenToggle {...props} />);
  expect(props.toggle).toHaveBeenCalledTimes(0);
  wrapper.simulate("click");
  expect(props.toggle).toHaveBeenCalledTimes(1);
});

it("calls toggle and onClick on click", () => {
  const props = { toggle: jest.fn(), onClick: jest.fn() };
  const wrapper = mount(<HiddenToggle {...props} />);
  expect(props.toggle).toHaveBeenCalledTimes(0);
  expect(props.onClick).toHaveBeenCalledTimes(0);
  wrapper.simulate("click");
  expect(props.toggle).toHaveBeenCalledTimes(1);
  expect(props.onClick).toHaveBeenCalledTimes(1);
});
