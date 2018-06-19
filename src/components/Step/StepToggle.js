import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { prop } from "styled-tools";
import as from "../../enhancers/as";
import callAll from "../../utils/callAll";
import Base from "../Base";

const toggle = props => () => props.toggle && props.toggle(props.step);

const Component = ({ onClick, ...props }) => (
  <Base onClick={callAll(toggle(props), onClick)} {...props} />
);

const StepToggle = styled(Component)`
  ${prop("theme.StepToggle")};
`;

StepToggle.propTypes = {
  toggle: PropTypes.func.isRequired,
  step: PropTypes.string.isRequired,
  onClick: PropTypes.func
};

export default as("button")(StepToggle);
