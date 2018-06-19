import React from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import { Block } from "reakit";
import { transform } from "buble";
import splitExampleCode from "react-styleguidist/lib/utils/splitExampleCode";
import ConfigContainer from "../containers/ConfigContainer";
import transformCode from "../utils/transformCode";

const compileCode = (code, config) =>
  transform(transformCode(code), config).code;
const wrapCodeInFragment = code => `<React.Fragment>${code}</React.Fragment>;`;

class Preview extends React.Component {
  static propTypes = {
    code: PropTypes.string.isRequired,
    config: PropTypes.object.isRequired
  };

  state = {
    error: null
  };

  componentDidMount() {
    this.executeCode();
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      this.state.error !== nextState.error || this.props.code !== nextProps.code
    );
  }

  componentDidUpdate(prevProps) {
    if (this.props.code !== prevProps.code) {
      this.executeCode();
    }
  }

  componentWillUnmount() {
    this.unmountPreview();
  }

  getExampleComponent(compiledCode) {
    try {
      return this.props.config.evalInContext(compiledCode)();
    } catch (e) {
      this.handleError(e);
    }
    return null;
  }

  mountNode = React.createRef();

  unmountPreview() {
    if (this.mountNode.current) {
      ReactDOM.unmountComponentAtNode(this.mountNode.current);
    }
  }

  executeCode() {
    this.setState({ error: null });

    const { code } = this.props;
    if (!code) return;

    const compiledCode = this.compileCode(code);
    if (!compiledCode) return;

    const { example } = splitExampleCode(compiledCode);
    const exampleComponent = this.getExampleComponent(example);

    window.requestAnimationFrame(() => {
      this.unmountPreview();
      try {
        ReactDOM.render(exampleComponent, this.mountNode.current);
      } catch (e) {
        this.handleError(e);
      }
    });
  }

  compileCode(code) {
    try {
      const wrappedCode = code.trim().match(/^</)
        ? wrapCodeInFragment(code)
        : code;
      return compileCode(wrappedCode, this.props.config.compilerConfig);
    } catch (e) {
      this.handleError(e);
    }
    return false;
  }

  handleError = e => {
    this.unmountPreview();
    this.setState({ error: e.toString() });
    console.error(e); // eslint-disable-line no-console
  };

  render() {
    const { error } = this.state;
    return (
      <React.Fragment>
        {error ? (
          <Block as="pre" fontSize={14} color="red">
            {error}
          </Block>
        ) : (
          <div ref={this.mountNode} />
        )}
      </React.Fragment>
    );
  }
}

export default props => (
  <ConfigContainer>
    {config => <Preview {...props} config={config} />}
  </ConfigContainer>
);
