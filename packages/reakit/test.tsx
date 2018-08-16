/* eslint-disable no-unused-expressions */
import React from "react";
import { styled, Base, Arrow } from "./src";

{
  const Test = styled(Base)<{ foo: string }>`
    color: ${props => props.foo};
  `;

  <Base />;
  <Base absolute />;
  <Test as="div" foo="" absolute />;
}

{
  const Test = styled(Arrow)<{ foo: string }>`
    color: ${props => props.foo};
  `;

  <Arrow />;
  <Arrow angle={10} />;
  <Test as="div" angle={10} foo="" absolute static />;
}
