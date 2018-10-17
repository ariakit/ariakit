import * as React from "react";
import * as PropTypes from "prop-types";
import { theme } from "styled-tools";
import callAll from "../_utils/callAll";
import styled from "../styled";
import Box, { BoxProps } from "../Box";
import { StepContainerSelectors, StepContainerActions } from "./StepContainer";

export interface StepNextProps extends BoxProps {
  next: StepContainerActions["next"];
  hasNext?: StepContainerSelectors["hasNext"];
  loop?: boolean;
  onClick?: React.MouseEventHandler;
}

const StepNextComponent = ({ onClick, ...props }: StepNextProps) => (
  <Box
    onClick={callAll(props.next, onClick)}
    disabled={!props.loop && props.hasNext && !props.hasNext()}
    {...props}
  />
);

const StepNext = styled(StepNextComponent)`
  ${theme("StepNext")};
`;

// @ts-ignore
StepNext.propTypes = {
  next: PropTypes.func.isRequired,
  hasNext: PropTypes.func,
  loop: PropTypes.bool,
  onClick: PropTypes.func
};

StepNext.defaultProps = {
  use: "button"
};

export default StepNext;
