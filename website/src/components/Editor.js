import React from "react";
import PropTypes from "prop-types";
import styled, { css } from "styled-components";
import { ifProp } from "styled-tools";
import debounce from "lodash/debounce";
import { UnControlled as CodeMirror } from "react-codemirror2";
import "codemirror/mode/jsx/jsx";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/dracula.css";
import ConfigContext from "./ConfigContext";

const StyledCodeMirror = styled(CodeMirror)`
  .CodeMirror {
    font-family: "Fira Code", monospace;
    line-height: 120%;
    background-color: rgb(0, 0, 0, 0.05) !important;
    padding: 1em;
    height: auto;
    .CodeMirror-lines {
      font-size: 14px;
      font-weight: 400;

      .CodeMirror-line {
        white-space: pre;
      }
    }

    ${ifProp(
      "options.readOnly",
      css`
        .CodeMirror-cursor {
          display: none;
        }
      `
    )};
  }
`;

class Editor extends React.Component {
  static propTypes = {
    code: PropTypes.string.isRequired,
    readOnly: PropTypes.bool.isRequired,
    onChange: PropTypes.func
  };

  shouldComponentUpdate() {
    return false;
  }

  handleChange = debounce((editor, metadata, newCode) => {
    const { onChange } = this.props;
    if (typeof onChange === "function") {
      onChange(newCode);
    }
  }, 10);

  render() {
    const { code, readOnly } = this.props;
    return (
      <ConfigContext.Consumer>
        {({ editorConfig }) => (
          <StyledCodeMirror
            value={code}
            onChange={this.handleChange}
            options={{ ...editorConfig, theme: "dracula", readOnly }}
          />
        )}
      </ConfigContext.Consumer>
    );
  }
}

export default Editor;
