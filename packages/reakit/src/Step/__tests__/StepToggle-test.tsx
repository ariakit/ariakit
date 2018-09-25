import * as React from "react";
import { mount } from "enzyme";
import StepToggle from "../StepToggle";

it("calls toggle on click", () => {
  const props = {
    toggle: jest.fn(),
    step: "b"
  };
  const wrapper = mount(<StepToggle {...props} />);
  expect(props.toggle).toHaveBeenCalledTimes(0);
  wrapper.simulate("click");
  expect(props.toggle).toHaveBeenCalledTimes(1);
  expect(props.toggle).toHaveBeenCalledWith("b");
});
