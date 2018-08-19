import React from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import { Block } from "reakit";
import StyleguidistContainer from "../containers/StyleguidistContainer";
import compileComponent from "../utils/compileComponent";

const processCode = (code, ...fns) =>
  fns.reduce((acc, fn) => {
    acc = fn(acc); // eslint-disable-line no-param-reassign
    return acc;
  }, code);

const addImports = string =>
  string.replace(
    /^(.*)$/m,
    `const { Provider } = require("reakit");\nconst theme = require("reakit-theme-default");\n$1`
  );

const addProviderWrapper = string =>
  string
    .replace(/(<[A-Z].*>)/m, "<Provider theme={theme}>\n$1")
    .replace(/(<[/][A-Z]\w+>)[^<]*$/, "$1\n</Provider>");

class Preview extends React.Component {
  static propTypes = {
    code: PropTypes.string.isRequired,
    evalInContext: PropTypes.func.isRequired,
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

  mountNode = React.createRef();

  unmountPreview() {
    if (this.mountNode.current) {
      ReactDOM.unmountComponentAtNode(this.mountNode.current);
    }
  }

  executeCode() {
    this.setState({ error: null });
    const { code, config, evalInContext } = this.props;
    if (!code) return;
    const processedCode = processCode(code, addImports, addProviderWrapper);
    console.log(processedCode);

    try {
      const exampleComponent = compileComponent(
        processedCode,
        config.compilerConfig,
        evalInContext
      );

      window.requestAnimationFrame(() => {
        this.unmountPreview();
        ReactDOM.render(exampleComponent, this.mountNode.current);
      });
    } catch (e) {
      this.handleError(e);
    }
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
  <StyleguidistContainer>
    {({ config, evalInContext }) => (
      <Preview evalInContext={evalInContext} config={config} {...props} />
    )}
  </StyleguidistContainer>
);
