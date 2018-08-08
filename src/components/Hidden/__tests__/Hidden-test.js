import React from "react";
import { mount, shallow } from "enzyme";
import Hidden from "../Hidden";

const wrap = comp => mount(shallow(comp).get(0));

const addEventListener = jest.spyOn(document.body, "addEventListener");

const raf = jest
  .spyOn(window, "requestAnimationFrame")
  .mockImplementation(cb => setTimeout(cb, 200));

const dispatchEvent = key => {
  const event = new KeyboardEvent("keydown", { key });
  document.body.dispatchEvent(event);
};

beforeEach(() => {
  jest.clearAllMocks();
});

it("adds event handler on mount", () => {
  const props = {
    hide: jest.fn(),
    visible: true,
    hideOnEsc: true,
    hideOnClickOutside: true
  };
  mount(<Hidden {...props} />);
  expect(addEventListener).toHaveBeenCalledTimes(2);
});

it("calls hide when press Escape", () => {
  const props = {
    hide: jest.fn(),
    hideOnEsc: true
  };
  const wrapper = mount(<Hidden {...props} />);
  wrapper.setProps({ visible: true });
  expect(props.hide).toHaveBeenCalledTimes(0);
  dispatchEvent("Enter");
  expect(props.hide).toHaveBeenCalledTimes(0);
  dispatchEvent("Escape");
  expect(props.hide).toHaveBeenCalledTimes(1);
});

it("calls hide when click outside", () => {
  const props = {
    hide: jest.fn(),
    hideOnClickOutside: true,
    visible: false
  };
  const wrapper = mount(<Hidden {...props} />);
  const clickEvent = new MouseEvent("click");

  document.body.dispatchEvent(clickEvent);
  expect(props.hide).toHaveBeenCalledTimes(0);
  wrapper.setProps({ visible: true });
  document.body.dispatchEvent(clickEvent);
  expect(props.hide).toHaveBeenCalledTimes(1);
});

it("has true visible state when visible prop is truthy", () => {
  const props = { visible: true };
  const wrapper = wrap(<Hidden {...props} />);
  expect(wrapper.state("visible")).toBe(true);
});

it("has false visible state when visible prop is falsy", () => {
  const props = { visible: false };
  const wrapper = wrap(<Hidden {...props} />);
  expect(wrapper.state("visible")).toBe(false);
});

it("has true transitioning state when transitioning prop is truthy", () => {
  const props = { transitioning: true };
  const wrapper = wrap(<Hidden {...props} />);
  expect(wrapper.state("transitioning")).toBe(true);
});

it("has false transitioning state when transitioning prop is falsy", () => {
  const props = { transitioning: false };
  const wrapper = wrap(<Hidden {...props} />);
  expect(wrapper.state("transitioning")).toBe(false);
});

it("removes the element from the dom when unmount has been passed", () => {
  const wrapper = mount(<Hidden />);
  expect(wrapper.html()).not.toBe(null);
  wrapper.setProps({ unmount: true });
  expect(wrapper.html()).toBe(null);
  wrapper.setProps({ visible: true });
  expect(wrapper.html()).not.toBe(null);
});

it("waits for the transition to complete before unmounting", async () => {
  jest.useFakeTimers();
  const wrapper = wrap(<Hidden unmount visible fade />);
  wrapper.setProps({ visible: false });
  expect(wrapper.state()).toEqual({ visible: false, transitioning: true });
  wrapper.simulate("transitionEnd");
  expect(wrapper.state()).toEqual({ visible: false, transitioning: false });
  expect(raf).not.toHaveBeenCalled();
  wrapper.setProps({ visible: true });
  expect(raf).toHaveBeenCalled();
  expect(wrapper.state()).toEqual({ visible: false, transitioning: true });
  wrapper.simulate("transitionEnd");
  jest.runAllTimers();
  expect(wrapper.state()).toEqual({ visible: true, transitioning: false });
});
