import * as React from "react";
import * as PropTypes from "prop-types";
import { theme } from "styled-tools";
import { Omit } from "../_utils/types";
import hoist from "../_utils/hoist";
import styled from "../styled";
import use from "../use";
import HiddenShow, { HiddenShowProps } from "../Hidden/HiddenShow";
import { StepContainerActions } from "./StepContainer";

export interface StepShowProps extends Omit<HiddenShowProps, "show"> {
  show: StepContainerActions["show"];
  step: string;
}

const show = (props: StepShowProps) => () =>
  props.show && props.show(props.step);

const StepShowComponent = (props: StepShowProps) => (
  <HiddenShow {...props} show={show(props)} />
);

const StepShow = styled(hoist(StepShowComponent, HiddenShow))`
  ${theme("StepShow")};
`;

// @ts-ignore
StepShow.propTypes = {
  show: PropTypes.func.isRequired,
  step: PropTypes.string.isRequired
};

export default use(StepShow, "button");
