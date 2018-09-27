/* eslint-disable no-unused-expressions */
import * as React from "react";
import { styled, Box, Code, Card, Step, Tabs } from "./src";

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
  <Card gutter={8} />;

  <Step.Container>
    {step => (
      <div>
        <Step.Hide hide={step.hide} />
        <Step step="test" {...step} />
      </div>
    )}
  </Step.Container>;
}
