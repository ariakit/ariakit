import React from "react";
import PropTypes from "prop-types";
import { theme } from "styled-tools";
import styled from "../styled";
import as from "../as";
import HiddenShow from "../Hidden/HiddenShow";

const show = props => () => props.show && props.show(props.step);
const Component = props => <HiddenShow {...props} show={show(props)} />;

const StepShow = styled(Component)`
  ${theme("StepShow")};
`;

StepShow.propTypes = {
  show: PropTypes.func.isRequired,
  step: PropTypes.string.isRequired
};

export default as("button")(StepShow);
