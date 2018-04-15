import React from "react";
import { Block, Group, Button, Input } from "reas";
import Editor from "./Editor";
import Code from "./Code";
import HomeCard from "./HomeCard";

const code = `import React from "react";
import { Group, Input, Button } from "reas";

const Component = () => (
  <Group vertical>
    <Input placeholder="Input" />
    <Button>Button</Button>
  </Group>
);`;

const HomeCards = () => (
  <React.Fragment>
    <HomeCard title="Install">
      <Block>npm</Block>
      <Code margin="10px 0 20px" block>
        npm i reas
      </Code>
      <Block>browser</Block>
      <Code
        margin="10px 0 20px"
        block
      >{`<script src="https://unpkg.com/reas"></script>`}</Code>
    </HomeCard>
    <HomeCard title="Compose">
      <Editor readOnly code={code} />
    </HomeCard>
    <HomeCard title="Render" width="100%">
      <Group vertical>
        <Input placeholder="Input" />
        <Button>Button</Button>
      </Group>
    </HomeCard>
  </React.Fragment>
);

export default HomeCards;
