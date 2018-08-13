import React from "react";
import PropTypes from "prop-types";
import { prop } from "styled-tools";
import callAll from "../_utils/callAll";
import styled from "../styled";
import as from "../as";
import Base from "../Base";

const Component = ({ onClick, ...props }) => (
  <Base
    onClick={callAll(props.next, onClick)}
    disabled={!props.loop && props.hasNext && !props.hasNext()}
    {...props}
  />
);

const StepNext = styled(Component)`
  ${prop("theme.StepNext")};
`;

StepNext.propTypes = {
  next: PropTypes.func.isRequired,
  hasNext: PropTypes.func,
  loop: PropTypes.bool,
  onClick: PropTypes.func
};

export default as("button")(StepNext);
