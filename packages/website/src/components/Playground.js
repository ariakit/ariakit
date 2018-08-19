import React from "react";
import PropTypes from "prop-types";
import { styled, Flex, Block, Input } from "reakit";
import Preview from "./Preview";
import StateContainer from "../containers/StateContainer";
import EditorWithTabs from "./EditorWithTabs";

const Wrapper = styled(Flex)`
  flex-direction: column;
  margin: 2em 0 1em;
`;

const ThemeWrapper = styled(Flex)`
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 1em;
`;

const PreviewWrapper = styled(Block)`
  padding: 16px;
  background-color: rgba(0, 0, 0, 0.05);
  max-width: 100vw;
`;

const ThemeInput = styled(Input.as("select"))`
  margin-left: 0.6em;
  max-width: 15%;
  height: min-content;
  width: min-content;
  background-color: transparent;
`;

const StyledSpan = styled("span")`
  font-size: 1.1em;
`;

const Playground = ({ code, evalInContext, ...props }) => (
  <StateContainer initialState={{ ownCode: code, theme: "Default" }}>
    {({ ownCode, theme, setState }) => (
      <Wrapper {...props}>
        <ThemeWrapper>
          <StyledSpan>Theme</StyledSpan>
          <ThemeInput
            onChange={event => setState({ theme: event.target.value })}
          >
            <option>Default</option>
            <option>None</option>
          </ThemeInput>
        </ThemeWrapper>
        <PreviewWrapper>
          <Preview code={ownCode} evalInContext={evalInContext} theme={theme} />
        </PreviewWrapper>
        <EditorWithTabs
          code={ownCode}
          onChange={newCode => setState({ ownCode: newCode })}
          evalInContext={evalInContext}
        />
      </Wrapper>
    )}
  </StateContainer>
);

Playground.propTypes = {
  code: PropTypes.string.isRequired,
  evalInContext: PropTypes.func.isRequired
};

export default Playground;
