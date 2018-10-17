import * as React from "react";
import * as PropTypes from "prop-types";
import { theme } from "styled-tools";
import callAll from "../_utils/callAll";
import styled from "../styled";
import Box, { BoxProps } from "../Box";
import { StepContainerSelectors, StepContainerActions } from "./StepContainer";

export interface StepPreviousProps extends BoxProps {
  previous: StepContainerActions["previous"];
  hasPrevious?: StepContainerSelectors["hasPrevious"];
  loop?: boolean;
  onClick?: React.MouseEventHandler;
}

const StepPreviousComponent = ({ onClick, ...props }: StepPreviousProps) => (
  <Box
    onClick={callAll(props.previous, onClick)}
    disabled={!props.loop && props.hasPrevious && !props.hasPrevious()}
    {...props}
  />
);

const StepPrevious = styled(StepPreviousComponent)`
  ${theme("StepPrevious")};
`;

// @ts-ignore
StepPrevious.propTypes = {
  use: "button",
  previous: PropTypes.func.isRequired,
  hasPrevious: PropTypes.func,
  loop: PropTypes.bool,
  onClick: PropTypes.func
};

export default StepPrevious;
