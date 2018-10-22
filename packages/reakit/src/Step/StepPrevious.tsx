import * as React from "react";
import * as PropTypes from "prop-types";
import { theme } from "styled-tools";
import callAll from "../_utils/callAll";
import hoist from "../_utils/hoist";
import styled from "../styled";
import use from "../use";
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

const StepPrevious = styled(hoist(StepPreviousComponent, Box))`
  ${theme("StepPrevious")};
`;

// @ts-ignore
StepPrevious.propTypes = {
  previous: PropTypes.func.isRequired,
  hasPrevious: PropTypes.func,
  loop: PropTypes.bool,
  onClick: PropTypes.func
};

export default use(StepPrevious, "button");
