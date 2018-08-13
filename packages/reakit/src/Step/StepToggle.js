import React from "react";
import PropTypes from "prop-types";
import { prop } from "styled-tools";
import styled from "../styled";
import as from "../as";
import HiddenToggle from "../Hidden/HiddenToggle";

const toggle = props => () => props.toggle && props.toggle(props.step);
const Component = props => <HiddenToggle {...props} toggle={toggle(props)} />;

const StepToggle = styled(Component)`
  ${prop("theme.StepToggle")};
`;

StepToggle.propTypes = {
  toggle: PropTypes.func.isRequired,
  step: PropTypes.string.isRequired
};

export default as("button")(StepToggle);
