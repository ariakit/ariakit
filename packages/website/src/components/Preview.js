import React from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import { Block } from "reakit";
import StyleguidistContainer from "../containers/StyleguidistContainer";
import compileComponent from "../utils/compileComponent";

class Preview extends React.Component {
  static propTypes = {
    code: PropTypes.string.isRequired,
    evalInContext: PropTypes.func.isRequired,
    config: PropTypes.object.isRequired,
    theme: PropTypes.string
  };

  state = {
    error: null
  };

  componentDidMount() {
    this.executeCode();
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      this.props.theme !== nextProps.theme ||
      this.state.error !== nextState.error ||
      this.props.code !== nextProps.code
    );
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.code !== prevProps.code ||
      this.props.theme !== prevProps.theme
    ) {
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
    const { code, config, evalInContext, theme } = this.props;
    if (!code) return;

    try {
      const exampleComponent = compileComponent(
        code,
        config.compilerConfig,
        evalInContext,
        theme
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
          <Block use="pre" fontSize={14} color="red">
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
