import * as React from "react";
import * as PropTypes from "prop-types";
import { theme } from "styled-tools";
import styled from "../styled";
import as from "../as";
import HiddenToggle from "../Hidden/HiddenToggle";
import { Toggle } from "./StepContainer";

interface ToggleProps {
  toggle?: Toggle;
  step: string;
}

const toggle = (props: ToggleProps) => () =>
  props.toggle && props.toggle(props.step);

const Component = (props: ToggleProps) => (
  <HiddenToggle {...props} toggle={toggle(props)} />
);

const StepToggle = styled(Component)`
  ${theme("StepToggle")};
`;

// @ts-ignore
StepToggle.propTypes = {
  toggle: PropTypes.func.isRequired,
  step: PropTypes.string.isRequired
};

export default as("button")(StepToggle);
