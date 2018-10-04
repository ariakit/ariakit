import * as React from "react";
import * as PropTypes from "prop-types";
import { theme } from "styled-tools";
import styled from "../styled";
import as from "../as";
import { Omit } from "../_utils/types";
import HiddenToggle, { HiddenToggleProps } from "../Hidden/HiddenToggle";
import { StepContainerActions } from "./StepContainer";

export interface StepToggleProps extends Omit<HiddenToggleProps, "toggle"> {
  toggle?: StepContainerActions["toggle"];
  step: string;
}

const toggle = (props: StepToggleProps) => () =>
  props.toggle && props.toggle(props.step);

const Component = (props: StepToggleProps) => (
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
