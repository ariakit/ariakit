import React from "react";
import styled from "styled-components";
import { mount, configure } from "enzyme";
import { Container } from "constate";
import renderer from "react-test-renderer";
import Provider from "../Provider";
import Adapter from "./ReactSixteenAdapter";
import "jest-styled-components";

configure({ adapter: new Adapter() });
// Fix incoming in next React version: https://github.com/facebook/react/issues/13150#issuecomment-411134477
// eslint-disable-next-line
console.error = () => null;

test("works as ThemeProvider", () => {
  const theme = { color: "purple" };
  const Child = styled.a`
    color: ${props => props.theme.color};
  `;
  const wrapper = renderer
    .create(
      <Provider theme={theme}>
        <Child />
      </Provider>
    )
    .toJSON();

  expect(wrapper).toHaveStyleRule("color", "purple");
});

test("works as constateProvider", () => {
  const wrapper = mount(
    <Provider initialState={{ foo: { value: "bar" } }}>
      <Container context="foo">
        {({ value }) => <div state={value} />}
      </Container>
    </Provider>
  );
  expect(
    wrapper
      .update()
      .find("div")
      .prop("state")
  ).toEqual("bar");
});
