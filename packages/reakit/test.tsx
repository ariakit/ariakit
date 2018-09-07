/* eslint-disable no-unused-expressions */
import * as React from "react";
import { styled, Base } from "./src";

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
