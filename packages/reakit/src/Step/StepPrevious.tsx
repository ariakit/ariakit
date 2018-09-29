import * as React from "react";
import * as PropTypes from "prop-types";
import { theme } from "styled-tools";
import callAll from "../_utils/callAll";
import styled from "../styled";
import as from "../as";
import Box from "../Box";
import { StepContainerSelectors, StepContainerActions } from "./StepContainer";

export interface StepPreviousProps {
  previous: StepContainerActions["previous"];
  hasPrevious?: StepContainerSelectors["hasPrevious"];
  loop?: boolean;
  onClick?: () => any;
}

const Component = ({ onClick, ...props }: StepPreviousProps) => (
  <Box
    onClick={callAll(props.previous, onClick)}
    disabled={!props.loop && props.hasPrevious && !props.hasPrevious()}
    {...props}
  />
);

const StepPrevious = styled(Component)`
  ${theme("StepPrevious")};
`;

// @ts-ignore
StepPrevious.propTypes = {
  previous: PropTypes.func.isRequired,
  hasPrevious: PropTypes.func,
  loop: PropTypes.bool,
  onClick: PropTypes.func
};

export default as("button")(StepPrevious);
