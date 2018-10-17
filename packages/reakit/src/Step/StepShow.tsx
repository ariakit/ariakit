import * as React from "react";
import * as PropTypes from "prop-types";
import { theme } from "styled-tools";
import styled from "../styled";
import { Omit } from "../_utils/types";
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

const StepShow = styled(StepShowComponent)`
  ${theme("StepShow")};
`;

// @ts-ignore
StepShow.propTypes = {
  show: PropTypes.func.isRequired,
  step: PropTypes.string.isRequired
};

export default StepShow;
