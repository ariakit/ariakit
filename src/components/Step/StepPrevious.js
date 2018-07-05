import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { prop } from "styled-tools";
import as from "../../enhancers/as";
import callAll from "../../utils/callAll";
import Base from "../Base";

const Component = ({ onClick, ...props }) => (
  <Base
    onClick={callAll(props.previous, onClick)}
    disabled={!props.loop && props.hasPrevious && !props.hasPrevious()}
    {...props}
  />
);

const StepPrevious = styled(Component)`
  ${prop("theme.StepPrevious")};
`;

StepPrevious.propTypes = {
  previous: PropTypes.func.isRequired,
  hasPrevious: PropTypes.func,
  loop: PropTypes.bool,
  onClick: PropTypes.func
};

export default as("button")(StepPrevious);
