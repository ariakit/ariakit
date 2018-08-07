import React from "react";
import PropTypes from "prop-types";
import { styled } from "reakit";
import { ifProp } from "styled-tools";
import debounce from "lodash/debounce";
import { UnControlled as CodeMirror } from "react-codemirror2";
import "codemirror/mode/jsx/jsx";
import "codemirror/mode/htmlmixed/htmlmixed";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/dracula.css";
import "codemirror/theme/oceanic-next.css";
import StyleguidistContainer from "../containers/StyleguidistContainer";
import ViewportContainer from "../containers/ViewportContainer";
import requireToImport from "../utils/requireToImport";

const StyledCodeMirror = styled(CodeMirror)`
  margin-bottom: 2em;
  max-width: 100vw;

  .CodeMirror {
    font-family: "Fira Code", monospace;
    padding: 1em;
    height: auto;

    @media (max-width: 768px) {
      padding: 1em 8px;
    }

    .CodeMirror-cursors {
      ${ifProp("options.readOnly", "display: none")};
    }

    .CodeMirror-lines {
      font-size: 16px;
      line-height: 1.4;

      @media (max-width: 768px) {
        font-size: 14px;
      }
    }
  }
`;

class Editor extends React.Component {
  handleChange = debounce((editor, metadata, newCode) => {
    const { onChange } = this.props;
    if (onChange) onChange(newCode);
  }, 500);

  static propTypes = {
    code: PropTypes.string.isRequired,
    readOnly: PropTypes.bool,
    onChange: PropTypes.func
  };

  shouldComponentUpdate() {
    return false;
  }

  render() {
    const { code, readOnly, ...props } = this.props;
    return (
      <StyleguidistContainer>
        {({ config }) => (
          <ViewportContainer>
            {({ width }) => (
              <StyledCodeMirror
                {...props}
                value={requireToImport(code)}
                onChange={this.handleChange}
                options={{
                  ...config.editorConfig,
                  tabSize: 2,
                  theme: readOnly && width > 768 ? "oceanic-next" : "dracula",
                  readOnly: width <= 768 ? "nocursor" : readOnly
                }}
              />
            )}
          </ViewportContainer>
        )}
      </StyleguidistContainer>
    );
  }
}

export default Editor;
