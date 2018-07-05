import React from "react";
import { styled, Flex } from "reakit";
import Editor from "./Editor";
import Preview from "./Preview";
import StateContainer from "../containers/StateContainer";
import ContentWrapper from "../elements/ContentWrapper";
import HomeExamplePreview from "./HomeExamplePreview";

const initialCode = `
import React from "react";
import { Button, Popover } from "reakit";

<Popover.Container>
  {({ toggle, visible }) => (
    <Button onClick={toggle}>
      Click me
      <Popover visible={visible}>
        <Popover.Arrow />
        Popover
      </Popover>
    </Button>
  )}
</Popover.Container>
`;

const Wrapper = styled(Flex)`
  width: 100%;
  justify-content: space-around;
  background-color: #282a36;
`;

const Content = styled(ContentWrapper)`
  width: auto;
  max-width: 100%;
  align-items: flex-end;
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

const StyledEditor = styled(Editor)`
  margin: 1em 0;
`;

const HomeExample = props => (
  <Wrapper {...props}>
    <StateContainer initialState={{ code: initialCode.trim() }}>
      {({ code, setState }) => (
        <Content>
          <StyledEditor
            code={code}
            onChange={c => setState({ code: c.trim() })}
          />
          <HomeExamplePreview>
            <Preview code={code} />
          </HomeExamplePreview>
        </Content>
      )}
    </StateContainer>
  </Wrapper>
);

export default HomeExample;
