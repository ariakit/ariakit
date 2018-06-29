import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { prop } from "styled-tools";
import as from "../../enhancers/as";
import callAll from "../../utils/callAll";
import Base from "../Base";

const Component = ({ onClick, ...props }) => (
  <Base onClick={callAll(props.hide, onClick)} {...props} />
);

const StepHide = styled(Component)`
  ${prop("theme.StepHide")};
`;

StepHide.propTypes = {
  hide: PropTypes.func.isRequired,
  onClick: PropTypes.func
};

export default as("button")(StepHide);
