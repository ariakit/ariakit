import React from "react";
import PropTypes from "prop-types";
import debounce from "lodash/debounce";
import { UnControlled as CodeMirror } from "react-codemirror2";
import "codemirror/mode/jsx/jsx";

// eslint-disable-next-line import/no-unresolved
import "!!style-loader!css-loader!codemirror/lib/codemirror.css";

class Editor extends React.Component {
  static propTypes = {
    code: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired
  };

  shouldComponentUpdate() {
    return false;
  }

  handleChange = debounce((editor, metadata, newCode) => {
    this.props.onChange(newCode);
  }, 10);

  render() {
    return <CodeMirror value={this.props.code} onChange={this.handleChange} />;
  }
}

export default Editor;
