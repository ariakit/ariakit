import React from "react";
import { mount } from "enzyme";
import Step from "../Step";
import Hidden from "../../Hidden";

const props = {
  step: "foo",
  order: 0,
  register: jest.fn(),
  update: jest.fn(),
  unregister: jest.fn()
};

beforeEach(() => {
  Object.keys(props).forEach(key => {
    if (props[key].mockClear) {
      props[key].mockClear();
    }
  });
});

it("registers on mount", () => {
  mount(<Step {...props} />);
  expect(props.register).toHaveBeenCalledWith("foo", 0);
});

it("calls update when step has changed", () => {
  const wrapper = mount(<Step {...props} />);
  wrapper.setProps({ step: "bar" });
  expect(props.update).toHaveBeenCalledWith("foo", "bar", 0);
});

it("calls update when order has changed", () => {
  const wrapper = mount(<Step {...props} />);
  wrapper.setProps({ order: 1 });
  expect(props.update).toHaveBeenCalledWith("foo", "foo", 1);
});

it("does not call update when other prop has changed", () => {
  const wrapper = mount(<Step {...props} />);
  wrapper.setProps({ foo: "bar" });
  expect(props.update).not.toHaveBeenCalled();
});

it("calls unregister on unmount", () => {
  const wrapper = mount(<Step {...props} />);
  wrapper.unmount();
  expect(props.unregister).toHaveBeenCalledWith("foo");
});

it("has truthy visible property when it is current", () => {
  const wrapper = mount(<Step {...props} isCurrent={() => true} />);
  expect(wrapper.find(Hidden).prop("visible")).toBe(true);
});

it("has falsy visible property when it is not current", () => {
  const wrapper = mount(<Step {...props} />);
  expect(wrapper.find(Hidden).prop("visible")).toBe(false);
});
