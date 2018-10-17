import * as React from "react";
import * as PropTypes from "prop-types";
import { theme } from "styled-tools";
import styled from "../styled";
import { Omit } from "../_utils/types";
import HiddenToggle, { HiddenToggleProps } from "../Hidden/HiddenToggle";
import { StepContainerActions } from "./StepContainer";

export interface StepToggleProps extends Omit<HiddenToggleProps, "toggle"> {
  toggle?: StepContainerActions["toggle"];
  step: string;
}

const toggle = (props: StepToggleProps) => () =>
  props.toggle && props.toggle(props.step);

const StepToggleComponent = (props: StepToggleProps) => (
  <HiddenToggle {...props} toggle={toggle(props)} />
);

const StepToggle = styled(StepToggleComponent)`
  ${theme("StepToggle")};
`;

// @ts-ignore
StepToggle.propTypes = {
  toggle: PropTypes.func.isRequired,
  step: PropTypes.string.isRequired
};

export default StepToggle;
