import * as React from "react";
import { mount } from "enzyme";
import StepShow from "../StepShow";

it("calls show on click", () => {
  const props = {
    show: jest.fn(),
    step: "b"
  };
  const wrapper = mount(<StepShow {...props} />);
  expect(props.show).toHaveBeenCalledTimes(0);
  wrapper.simulate("click");
  expect(props.show).toHaveBeenCalledTimes(1);
  expect(props.show).toHaveBeenCalledWith("b");
});
