import React from "react";
import PropTypes from "prop-types";
import { styled, Flex } from "reakit";
import Preview from "./Preview";
import StateContainer from "../containers/StateContainer";
import EditorWithTabs from "./EditorWithTabs";

const Wrapper = styled(Flex)`
  flex-direction: column;
  margin: 16px 0 24px;
`;

const PreviewWrapper = styled(Flex)`
  padding: 16px;
  background-color: rgba(0, 0, 0, 0.03);
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
