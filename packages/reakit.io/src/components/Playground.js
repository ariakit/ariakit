import React from "react";
import PropTypes from "prop-types";
import { styled, Flex, Block } from "reakit";
import Preview from "./Preview";
import StateContainer from "../containers/StateContainer";
import EditorWithTabs from "./EditorWithTabs";

const Wrapper = styled(Flex)`
  flex-direction: column;
  margin: 2em 0 1em;
`;

const PreviewWrapper = styled(Block)`
  padding: 16px;
  background-color: rgba(0, 0, 0, 0.05);
  max-width: 100vw;
`;

const Playground = ({ code, evalInContext, ...props }) => (
  <StateContainer initialState={{ state: code }}>
    {({ state, setState }) => (
      <Wrapper {...props}>
        <PreviewWrapper>
          <Preview code={state} evalInContext={evalInContext} />
        </PreviewWrapper>
        <EditorWithTabs
          code={state}
          onChange={c => setState({ state: c.trim() })}
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
