import React from "react";
import { Block, Code, Button, Popover } from "../../../src";
import Editor from "./Editor";

const HomeCards = () => (
  <React.Fragment>
    <Block>
      <Block as="h2">Install</Block>
      <Block>yarn</Block>
      <Code block>yarn add reas</Code>
      <Block>npm</Block>
      <Code block>npm i reas</Code>
      <Block>browser</Block>
      <Code
        block
      >{`<script src="https://unpkg.com/reas@0.9.0"></script>`}</Code>
    </Block>
    <Block>
      <Editor
        readOnly
        code={`import React from "react";
import { Button, Popover } from "reas";

const Component = () => (
  <Button>
    Button
    <Popover visible>
      <Popover.Arrow />
      Popover
    </Popover>
  </Button>
);
`}
      />
    </Block>
    <Block>
      <Button>
        Button
        <Popover visible>
          <Popover.Arrow />
          Popover
        </Popover>
      </Button>
    </Block>
  </React.Fragment>
);

export default HomeCards;
