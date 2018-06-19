import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { prop } from "styled-tools";
import as from "../../enhancers/as";
import callAll from "../../utils/callAll";
import Base from "../Base";

const show = props => () => props.show && props.show(props.step);

const Component = ({ onClick, ...props }) => (
  <Base onClick={callAll(show(props), onClick)} {...props} />
);

const StepShow = styled(Component)`
  ${prop("theme.StepShow")};
`;

StepShow.propTypes = {
  show: PropTypes.func.isRequired,
  step: PropTypes.string.isRequired,
  onClick: PropTypes.func
};

export default as("button")(StepShow);
