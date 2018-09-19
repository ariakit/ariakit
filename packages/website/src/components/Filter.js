import React from "react";
import { Input } from "reakit";

class Filter extends React.Component {
  node = React.createRef();

  handleKeyDown = e => {
    const shouldFocus =
      e.key === "/" && document.activeElement !== this.node.current;
    if (shouldFocus) {
      e.preventDefault();
      this.node.current.focus();
    }
  };

  componentDidMount() {
    window.addEventListener("keydown", this.handleKeyDown);
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.handleKeyDown);
  }

  render = () => (
    <Input
      type="text"
      placeholder="Press / to filter"
      elementRef={this.node}
      {...this.props}
    />
  );
}

export default Filter;
