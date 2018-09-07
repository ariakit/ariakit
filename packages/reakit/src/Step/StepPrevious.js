import React from "react";
import PropTypes from "prop-types";
import { theme } from "styled-tools";
import callAll from "../_utils/callAll";
import styled from "../styled";
import as from "../as";
import Box from "../Box";

const Component = ({ onClick, ...props }) => (
  <Box
    onClick={callAll(props.previous, onClick)}
    disabled={!props.loop && props.hasPrevious && !props.hasPrevious()}
    {...props}
  />
);

const StepPrevious = styled(Component)`
  ${theme("StepPrevious")};
`;

StepPrevious.propTypes = {
  previous: PropTypes.func.isRequired,
  hasPrevious: PropTypes.func,
  loop: PropTypes.bool,
  onClick: PropTypes.func
};

export default as("button")(StepPrevious);
