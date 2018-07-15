import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { prop } from "styled-tools";
import as from "../../enhancers/as";
import createElementRef from "../../utils/createElementRef";
import Hidden from "../Hidden";

const noop = () => {};

class Component extends React.Component {
  constructor(props) {
    super(props);
    const { register, step, order } = this.props;
    register(step, order);
  }

  /**
   * @type HTMLElement | undefined
   */
  element = undefined;

  componentDidMount() {
    const { step, onEnter, current, indexOf } = this.props;

    if (onEnter && current === indexOf(step)) {
      onEnter(this.element);
    }
  }

  componentDidUpdate(prevProps) {
    const {
      step,
      update,
      order,
      indexOf,
      current,
      onEnter,
      onExit
    } = this.props;

    if (prevProps.step !== step || prevProps.order !== order) {
      update(prevProps.step, step, order);
    }

    if (prevProps.current !== current) {
      const index = indexOf(step);
      if (onEnter && prevProps.current !== index && current === index) {
        onEnter(this.element);
      } else if (onExit && prevProps.current === index) {
        onExit(this.element);
      }
    }
  }

  componentWillUnmount() {
    const { step, onExit, current, indexOf, unregister } = this.props;

    if (onExit && current === indexOf(step)) {
      onExit(this.element);
    }

    unregister(step);
  }

  render() {
    const { current, indexOf, step } = this.props;
    return (
      <Hidden
        destroy
        visible={current === indexOf(step)}
        {...this.props}
        elementRef={createElementRef(this, "element")}
      />
    );
  }
}

const Step = styled(Component)`
  ${prop("theme.Step")};
`;

Step.propTypes = {
  step: PropTypes.string.isRequired,
  current: PropTypes.number.isRequired,
  register: PropTypes.func.isRequired,
  update: PropTypes.func.isRequired,
  unregister: PropTypes.func.isRequired,
  indexOf: PropTypes.func.isRequired,
  order: PropTypes.number,
  onEnter: PropTypes.func,
  onExit: PropTypes.func
};

Step.defaultProps = {
  register: noop,
  update: noop,
  unregister: noop,
  indexOf: noop
};

export default as("div")(Step);
