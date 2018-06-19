import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { prop } from "styled-tools";
import as from "../../enhancers/as";
import Base from "../Base";
import callAll from "../../utils/callAll";

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
  hasNext: PropTypes.func.isRequired,
  loop: PropTypes.bool,
  onClick: PropTypes.func
};

export default as("button")(StepNext);
