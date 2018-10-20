import * as React from "react";
import * as PropTypes from "prop-types";
import { theme } from "styled-tools";
import hoist from "../_utils/hoist";
import styled from "../styled";
import use from "../use";
import Hidden, { HiddenProps } from "../Hidden";
import { StepContainerSelectors, StepContainerActions } from "./StepContainer";

export interface StepProps extends HiddenProps {
  step: string;
  isCurrent: StepContainerSelectors["isCurrent"];
  register: StepContainerActions["register"];
  update: StepContainerActions["update"];
  unregister: StepContainerActions["unregister"];
  order?: number;
}

class StepComponent extends React.Component<StepProps> {
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

const Step = styled(hoist(StepComponent, Hidden))`
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

export default use(Step, "div");
