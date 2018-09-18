/* eslint-disable no-unused-expressions */
import * as React from "react";
import { styled, Box, Code } from "./src";

interface Props {
  foo: string;
}

{
  const Test = styled(Box)<Props>`
    color: ${(props: Props) => props.foo};
  `;

  <Box />;
  <Box absolute />;
  <Test as="div" foo="" absolute />;
  <Code />;
  <Code block />;
}
