/* eslint-disable react/no-multi-comp */
import React from "react";
import styled from "styled-components";
import { shallow, mount } from "enzyme";
import as from "../as";

const createComponent = (element = "span", id = "Base") => {
  const Base = ({ as: T, ...props }) => <T {...props} id={id} />;
  Base.displayName = id;
  return as(element)(Base);
};

const getStack = (wrapper, stack = []) => {
  const type = wrapper.type();
  const nextStack = [...stack, type.displayName || type.name || type];
  const child = wrapper.childAt(0);

  if (!child.length) {
    return nextStack;
  }
  return getStack(child, nextStack);
};

it("creates component", () => {
  const Base = createComponent();
  const wrapper = mount(<Base />);

  expect(getStack(wrapper)).toMatchSnapshot();
  expect(wrapper).toMatchSnapshot();
  expect(wrapper.html()).toMatchSnapshot();
});

it("creates component by extending another one with styled", () => {
  const Base = createComponent();
  const Derivative = styled(Base)``;
  Derivative.displayName = "Derivative";
  const Div = as("div")(Derivative);
  const wrapper = mount(<Div />);

  expect(getStack(wrapper)).toMatchSnapshot();
  expect(wrapper).toMatchSnapshot();
  expect(wrapper.html()).toMatchSnapshot();
});

it("creates component by extending another one with extend", () => {
  const Base = createComponent();
  const Derivative = Base.extend``;
  Derivative.displayName = "Derivative";
  const Div = as("div")(Derivative);
  const wrapper = mount(<Div />);

  expect(getStack(wrapper)).toMatchSnapshot();
  expect(wrapper).toMatchSnapshot();
  expect(wrapper.html()).toMatchSnapshot();
});

it("creates component passing property as", () => {
  const Base = createComponent();
  const wrapper = mount(<Base as="div" />);

  expect(getStack(wrapper)).toMatchSnapshot();
  expect(wrapper).toMatchSnapshot();
  expect(wrapper.html()).toMatchSnapshot();
});

it("creates component with array of components", () => {
  const Derivative = ({ as: T, ...props }) => <T {...props} id="Derivative" />;
  const Base = createComponent([Derivative, "p"]);
  const wrapper = mount(<Base />);

  expect(getStack(wrapper)).toMatchSnapshot();
  expect(wrapper).toMatchSnapshot();
  expect(wrapper.html()).toMatchSnapshot();
});

it("creates component passing property as with array of components", () => {
  const Base = createComponent();
  const Derivative = ({ as: T, ...props }) => <T {...props} id="Derivative" />;
  const wrapper = mount(<Base as={[Derivative, "p"]} />);

  expect(getStack(wrapper)).toMatchSnapshot();
  expect(wrapper).toMatchSnapshot();
  expect(wrapper.html()).toMatchSnapshot();
});

it("creates component passing property as with another component", () => {
  const Base = createComponent();
  const Derivative = props => <div {...props} />;
  const wrapper = mount(<Base as={Derivative} />);

  expect(getStack(wrapper)).toMatchSnapshot();
  expect(wrapper).toMatchSnapshot();
  expect(wrapper.html()).toMatchSnapshot();
});

it("creates component using as static method", () => {
  const Base = createComponent();
  const Derivative = Base.as("p");
  const wrapper = mount(<Derivative />);

  expect(getStack(wrapper)).toMatchSnapshot();
  expect(wrapper).toMatchSnapshot();
  expect(wrapper.html()).toMatchSnapshot();
});

it("creates component using as static method with array of components", () => {
  const Base = createComponent();
  const Derivative = ({ as: T, ...props }) => <T {...props} id="Derivative" />;
  const Final = Base.as([Derivative, "p"]);
  const wrapper = mount(<Final />);

  expect(getStack(wrapper)).toMatchSnapshot();
  expect(wrapper).toMatchSnapshot();
  expect(wrapper.html()).toMatchSnapshot();
});

it("renders with style", () => {
  const Base = createComponent();
  const wrapper = shallow(<Base position="absolute" />);

  expect(wrapper.html()).toMatchSnapshot();
});

it("renders with style passing property as with another component", () => {
  const Base = createComponent();
  const Derivate = createComponent("div", "Derivate");
  const wrapper = shallow(<Base as={Derivate} position="absolute" />);

  expect(wrapper.html()).toMatchSnapshot();
});

it("renders with dangerouslySetInnerHTML", () => {
  const Base = createComponent();
  const props = { dangerouslySetInnerHTML: { __html: "<b>Hello</b>" } };
  const wrapper = shallow(<Base {...props} />);

  expect(wrapper.html()).toMatchSnapshot();
});

it("renders SVG element", () => {
  const Base = createComponent("svg");
  const wrapper = shallow(<Base as="circle" />);

  expect(wrapper.html()).toMatchSnapshot();
});

it("passes down elementRef", () => {
  const BaseComponent = createComponent();
  const Base = class extends React.Component {
    render() {
      return (
        <BaseComponent
          elementRef={element => {
            this.element = element;
          }}
        />
      );
    }
  };
  const wrapper = mount(<Base />);

  expect(wrapper.instance().element).toMatchSnapshot();
});

it("passes down elementRef when extended", () => {
  const BaseComponent = createComponent().extend``;
  class Base extends React.Component {
    render() {
      return (
        <BaseComponent
          elementRef={element => {
            this.element = element;
          }}
        />
      );
    }
  }
  const wrapper = mount(<Base />);

  expect(wrapper.instance().element).toMatchSnapshot();
});
