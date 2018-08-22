/* eslint-disable no-unused-expressions */
import * as React from "react";
import { styled, Base, Arrow } from "./src";

interface Props {
  foo: string;
}

{
  const Test = styled(Base)<Props>`
    color: ${(props: Props) => props.foo};
  `;

  <Base />;
  <Base absolute />;
  <Test as="div" foo="" absolute />;
}

{
  const Test = styled(Arrow)<Props>`
    color: ${(props: Props) => props.foo};
  `;

  <Arrow />;
  <Arrow angle={10} />;
  <Test as="div" angle={10} foo="" absolute static />;
}
