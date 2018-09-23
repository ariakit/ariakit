import * as React from "react";
import * as PropTypes from "prop-types";
import { theme } from "styled-tools";
import hoistNonReactStatics from "hoist-non-react-statics";
import styled from "../styled";
import as from "../as";
import Hidden, { HiddenProps } from "../Hidden";
import { Register, Update, Unregister, IsCurrent } from "./StepContainer";

export interface StepProps extends HiddenProps {
  [key: string]: any;
  step: string;
  register: Register;
  update: Update;
  unregister: Unregister;
  isCurrent: IsCurrent;
  order?: number;
}

class Component extends React.Component<StepProps> {
  constructor(props: StepProps) {
    super(props);
    const { register, step, order } = this.props;
    register(step, order);
  }

  componentDidUpdate(prevProps: StepProps) {
    const { step, update, order } = this.props;
    if (prevProps.step !== step || prevProps.order !== order) {
      update(prevProps.step, step, order);
    }
  }

  componentWillUnmount() {
    const { step, unregister } = this.props;
    unregister(step);
  }

  render() {
    const { isCurrent, step } = this.props;
    return <Hidden unmount visible={isCurrent(step)} {...this.props} />;
  }
}

// @ts-ignore
hoistNonReactStatics(Component, Hidden);

const Step = styled(Component)`
  ${theme("Step")};
`;

// @ts-ignore
Step.propTypes = {
  step: PropTypes.string.isRequired,
  register: PropTypes.func.isRequired,
  update: PropTypes.func.isRequired,
  unregister: PropTypes.func.isRequired,
  isCurrent: PropTypes.func.isRequired,
  order: PropTypes.number
};

export default as("div")(Step);
