/* eslint-disable no-unused-expressions */
import * as React from "react";
import { styled, Box, Code, Card, Step, Tabs, Popover } from "./src";

interface Props {
  foo: string;
}

{
  const Test = styled(Box)<Props>`
    color: ${(props: Props) => props.foo};
  `;

  <Box />;
  <Box absolute />;
  <Box use={Card} gutter={8} />;
  <Test use="div" foo="" absolute />;
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

  <Tabs.Container>
    {tabs => (
      <div>
        <Tabs>
          <Tabs.Tab
            tab="tab1"
            isCurrent={tabs.isCurrent}
            register={tabs.register}
            update={tabs.update}
            unregister={tabs.unregister}
            show={tabs.show}
            previous={tabs.previous}
            next={tabs.next}
            current={tabs.current}
          >
            Tab 1
          </Tabs.Tab>
          <Tabs.Tab tab="tab2" {...tabs}>
            Tab 2
          </Tabs.Tab>
        </Tabs>
        <Tabs.Panel tab="tab1" {...tabs}>
          Tab 1
        </Tabs.Panel>
        <Tabs.Panel tab="tab2" {...tabs}>
          Tab 2
        </Tabs.Panel>
      </div>
    )}
  </Tabs.Container>;

  <Popover.Container>
    {popover => (
      <div>
        <Popover.Toggle use={Code} codeClassName="" {...popover}>
          Toggle
        </Popover.Toggle>
        <Popover {...popover}>Popover</Popover>
      </div>
    )}
  </Popover.Container>;
}
