import React from "react";
import PropTypes from "prop-types";
import { styled, Flex, Grid, Label, Block, Input } from "reakit";
import camelCase from "lodash/camelCase";
import { palette } from "styled-tools";
import Preview from "./Preview";
import track from "../utils/track";
import StateContainer from "../containers/StateContainer";
import ThemeContainer from "../containers/ThemeContainer";
import EditorWithTabs from "./EditorWithTabs";

const Wrapper = styled(Flex)`
  position: relative;
  flex-direction: column;
  margin: 2em 0 1em;
`;

const PreviewWrapper = styled(Block)`
  padding: 16px;
  background-color: ${palette("background", -2)};
  max-width: 100vw;
  min-height: 3.5em;
`;

const ThemeWrapper = styled(Grid)`
  position: absolute;
  top: 0;
  right: 0;
  padding: 0.5em;
  grid-auto-flow: column;
  grid-gap: 0.5em;
  align-items: center;
`;

const ThemeInput = styled(Input.as("select"))``;

const Playground = ({ code, evalInContext, ...props }) => (
  <StateContainer initialState={{ ownCode: code }}>
    {({ ownCode, setState }) => (
      <ThemeContainer>
        {({ themes, theme, setTheme }) => (
          <Wrapper {...props}>
            <PreviewWrapper>
              <Block marginRight="8.5em">
                <Preview
                  code={ownCode}
                  evalInContext={evalInContext}
                  theme={theme}
                />
              </Block>
            </PreviewWrapper>
            <ThemeWrapper>
              <Label htmlFor="themeSelect">Theme</Label>
              <ThemeInput
                id="themeSelect"
                value={theme}
                onChange={e => {
                  setTheme(e.target.value);
                  track(`reakit.${camelCase(theme)}ThemeSelect`);
                }}
              >
                {themes.map(name => (
                  <option key={name}>{name}</option>
                ))}
              </ThemeInput>
            </ThemeWrapper>
            <EditorWithTabs
              code={ownCode}
              onChange={newCode => setState({ ownCode: newCode })}
              evalInContext={evalInContext}
            />
          </Wrapper>
        )}
      </ThemeContainer>
    )}
  </StateContainer>
);

Playground.propTypes = {
  code: PropTypes.string.isRequired,
  evalInContext: PropTypes.func.isRequired
};

export default Playground;
