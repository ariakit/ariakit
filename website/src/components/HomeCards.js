import React from "react";
import { Grid, Block, Button, Popover } from "reas";
import Editor from "./Editor";
import Code from "./Code";

const code = `import React from "react";
import { Button, Popover } from "reas";

const Component = () => (
  <Button>
    Button
    <Popover visible>
      <Popover.Arrow />
      Popover
    </Popover>
  </Button>
);`;

const HomeCards = () => (
  <React.Fragment>
    <Block>
      <Block as="h2">Install</Block>
      <Block>npm</Block>
      <Code block codeClassName="bash">
        npm i reas
      </Code>
      <Block>browser</Block>
      <Code block>{`<script src="https://unpkg.com/reas"></script>`}</Code>
    </Block>
    <Block>
      <Block as="h2">Use</Block>
      <Editor readOnly code={code} />
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
