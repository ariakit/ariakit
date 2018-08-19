import React from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import { Block } from "reakit";
import StyleguidistContainer from "../containers/StyleguidistContainer";
import compileComponent from "../utils/compileComponent";

const processCode = (code, ...fns) => fns.reduce((acc, fn) => fn(acc), code);

const addProviderWrapper = theme => string =>
  /<Provider/.test(string)
    ? string
    : string
        .replace(
          /(<[A-Za-z][^>]+>)/m,
          `<Provider theme={${theme}.default}>\n$1`
        )
        .replace(/(<[/]?[A-Za-z][^>]+>)[^<]*$/, "$1\n</Provider>");

const ProviderToProviderDotDefault = string =>
  string.replace(/Provider/g, "Provider.default");

class Preview extends React.Component {
  static propTypes = {
    code: PropTypes.string.isRequired,
    evalInContext: PropTypes.func.isRequired,
    config: PropTypes.object.isRequired,
    theme: PropTypes.string.isRequired
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
    if (!this.props.code) return;
    const { code, config, evalInContext, theme } = this.props;
    const processedCode = processCode(
      code,
      addProviderWrapper(theme),
      ProviderToProviderDotDefault
    );

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
