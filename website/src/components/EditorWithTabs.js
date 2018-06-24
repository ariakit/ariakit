import React from "react";
import PropTypes from "prop-types";
import { renderToStaticMarkup } from "react-dom/server";
import { styled, Block, Tabs, Group, Button } from "reakit";
import pretty from "pretty";
import Editor from "./Editor";
import compileComponent from "../utils/compileComponent";
import StyleguidistContainer from "../containers/StyleguidistContainer";

const Wrapper = styled(Block)`
  position: relative;

  ${Tabs} {
    display: block;
    position: absolute;
    top: 8px;
    right: 8px;
    z-index: 200;

    ${Button} {
      color: white;
      background-color: rgba(255, 255, 255, 0.1);
      border-color: rgba(0, 0, 0, 0.5);
      text-transform: uppercase;
      font-size: 0.85em;
      font-weight: 400;
      &.active {
        background-color: transparent;
      }
    }
  }
`;

const getHTML = (code, config, evalInContext) => {
  const component = compileComponent(code, config, evalInContext);
  const markup = renderToStaticMarkup(component);
  return pretty(markup.replace(/ class="[^"]+"/g, ""));
};

const EditorWithTabs = props => (
  <Tabs.Container>
    {tabs => (
      <Wrapper>
        <Tabs as={Group}>
          <Tabs.Tab as={Button} tab="jsx" {...tabs}>
            JSX
          </Tabs.Tab>
          <Tabs.Tab as={Button} tab="html" {...tabs}>
            HTML
          </Tabs.Tab>
        </Tabs>
        <Tabs.Panel tab="jsx" {...tabs}>
          <Editor {...props} />
        </Tabs.Panel>
        <Tabs.Panel tab="html" {...tabs}>
          <StyleguidistContainer>
            {({ config, evalInContext }) =>
              tabs.isCurrent("html") && (
                <Editor
                  {...props}
                  code={getHTML(
                    props.code,
                    config.compilerConfig,
                    evalInContext
                  )}
                  readOnly
                />
              )
            }
          </StyleguidistContainer>
        </Tabs.Panel>
      </Wrapper>
    )}
  </Tabs.Container>
);

EditorWithTabs.propTypes = {
  code: PropTypes.string.isRequired
};

export default EditorWithTabs;
