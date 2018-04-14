import React from "react";
import PropTypes from "prop-types";
import debounce from "lodash/debounce";
import { UnControlled as CodeMirror } from "react-codemirror2";
import "codemirror/mode/jsx/jsx";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/base16-light.css";
import ConfigContext from "./ConfigContext";

class Editor extends React.Component {
  static propTypes = {
    code: PropTypes.string.isRequired,
    readOnly: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired
  };

  shouldComponentUpdate() {
    return false;
  }

  handleChange = debounce((editor, metadata, newCode) => {
    this.props.onChange(newCode);
  }, 10);

  render() {
    const { code, readOnly } = this.props;
    return (
      <ConfigContext.Consumer>
        {({ editorConfig }) => (
          <CodeMirror
            value={code}
            onChange={this.handleChange}
            options={{ ...editorConfig, readOnly }}
          />
        )}
      </ConfigContext.Consumer>
    );
  }
}

export default Editor;
