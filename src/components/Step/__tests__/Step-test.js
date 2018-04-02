import React from "react";
import { mount } from "enzyme";
import Step from "../Step";
import Hidden from "../../Hidden";

const props = {
  step: "foo",
  current: 0,
  order: 0,
  register: jest.fn(),
  update: jest.fn(),
  unregister: jest.fn(),
  indexOf: jest.fn(() => 0),
  onEnter: jest.fn(),
  onExit: jest.fn()
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

it("calls onEnter on mount", () => {
  mount(<Step {...props} />);
  expect(props.onEnter).toHaveBeenCalledWith(expect.any(Object));
});

it("does not call onEnter on mount when it was not passed in", () => {
  const { onEnter, ...nextProps } = props;
  mount(<Step {...nextProps} />);
  expect(props.onEnter).not.toHaveBeenCalled();
});

it("calls update when step is changed", () => {
  const wrapper = mount(<Step {...props} />);
  wrapper.setProps({ step: "bar" });
  expect(props.update).toHaveBeenCalledWith("foo", "bar", 0);
});

it("calls update when order is changed", () => {
  const wrapper = mount(<Step {...props} />);
  wrapper.setProps({ order: 1 });
  expect(props.update).toHaveBeenCalledWith("foo", "foo", 1);
});

it("calls onEnter when current has changed to it", () => {
  const nextProps = { ...props, current: 1 };
  const wrapper = mount(<Step {...nextProps} />);
  wrapper.setProps({ current: 0 });
  expect(props.onEnter).toHaveBeenCalledWith(expect.any(Object));
});

it("does not call onEnter when it was not passed in ", () => {
  const { onEnter, ...nextProps } = { ...props, current: 1 };
  const wrapper = mount(<Step {...nextProps} />);
  wrapper.setProps({ current: 0 });
  expect(props.onEnter).not.toHaveBeenCalled();
});

it("calls onExit when current has changed from it", () => {
  const wrapper = mount(<Step {...props} />);
  wrapper.setProps({ current: 1 });
  expect(props.onExit).toHaveBeenCalledWith(expect.any(Object));
});

it("does not call onExit when it was not passed in ", () => {
  const { onExit, ...nextProps } = props;
  const wrapper = mount(<Step {...nextProps} />);
  wrapper.setProps({ current: 1 });
  expect(props.onExit).not.toHaveBeenCalled();
});

it("calls onExit on unmount when it is current", () => {
  const wrapper = mount(<Step {...props} />);
  wrapper.unmount();
  expect(props.onExit).toHaveBeenCalledWith(expect.any(Object));
});

it("does not call onExit on unmount when it is not current", () => {
  const nextProps = { ...props, current: 1 };
  const wrapper = mount(<Step {...nextProps} />);
  wrapper.unmount();
  expect(props.onExit).not.toHaveBeenCalled();
});

it("does not call onExit on unmount when it was not passed in", () => {
  const { onExit, ...nextProps } = props;
  const wrapper = mount(<Step {...nextProps} />);
  wrapper.unmount();
  expect(props.onExit).not.toHaveBeenCalled();
});

it("calls unregister on unmount", () => {
  const wrapper = mount(<Step {...props} />);
  wrapper.unmount();
  expect(props.unregister).toHaveBeenCalledWith("foo");
});

it("has truthy visible property when it is current", () => {
  const wrapper = mount(<Step {...props} />);
  expect(wrapper.find(Hidden).prop("visible")).toBe(true);
});

it("has falsy visible property when it is not current", () => {
  const nextProps = { ...props, current: 1 };
  const wrapper = mount(<Step {...nextProps} />);
  expect(wrapper.find(Hidden).prop("visible")).toBe(false);
});
