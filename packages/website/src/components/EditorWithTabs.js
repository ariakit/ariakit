import React from "react";
import PropTypes from "prop-types";
import { renderToStaticMarkup } from "react-dom/server";
import { styled, Block, Tabs, Group, Button } from "reakit";
import PencilIcon from "react-icons/lib/md/create";
import pretty from "pretty";
import Editor from "./Editor";
import compileComponent from "../utils/compileComponent";
import StyleguidistContainer from "../containers/StyleguidistContainer";
import track from "../utils/track";
import IconOnLeft from "../elements/IconOnLeft";

const Wrapper = styled(Block)`
  position: relative;

  .CodeMirror-line:first-child {
    margin-right: 90px;
  }

  ${Tabs} {
    position: absolute;
    top: 8px;
    right: 8px;
    z-index: 200;

    ${Button} {
      color: white;
      background-color: rgba(255, 255, 255, 0.1);
      text-transform: uppercase;
      font-size: 0.85em;
      font-weight: 400;
      flex: none;
      padding: 0 8px;
      &.active {
        background-color: transparent;
      }
    }
  }
`;

const StyledPencilIcon = styled(PencilIcon)`
  @media (max-width: 768px) {
    display: none;
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
          <Tabs.Tab
            as={[IconOnLeft, Button]}
            tab="jsx"
            onClick={track("reakit.editorTabsJSXClick")}
            {...tabs}
          >
            <StyledPencilIcon /> JSX
          </Tabs.Tab>
          <Tabs.Tab
            as={[IconOnLeft, Button]}
            tab="html"
            onClick={track("reakit.editorTabsHTMLClick")}
            {...tabs}
          >
            HTML
          </Tabs.Tab>
        </Tabs>
        <Tabs.Panel tab="jsx" {...tabs}>
          <Editor {...props} />
        </Tabs.Panel>
        <Tabs.Panel tab="html" {...tabs}>
          <StyleguidistContainer>
            {({ config }) =>
              tabs.isCurrent("html") && (
                <Editor
                  {...props}
                  code={getHTML(
                    props.code,
                    config.compilerConfig,
                    props.evalInContext
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
  code: PropTypes.string.isRequired,
  evalInContext: PropTypes.func.isRequired
};

export default EditorWithTabs;
