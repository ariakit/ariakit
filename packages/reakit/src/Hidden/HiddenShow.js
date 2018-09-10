import React from "react";
import PropTypes from "prop-types";
import { prop } from "styled-tools";
import callAll from "../_utils/callAll";
import styled from "../styled";
import as from "../as";
import Base from "../Base";

const Component = ({ onClick, ...props }) => (
  <Base onClick={callAll(props.show, onClick)} {...props} />
);

const HiddenShow = styled(Component)`
  ${prop("theme.HiddenShow")};
`;

HiddenShow.propTypes = {
  show: PropTypes.func.isRequired,
  onClick: PropTypes.func
};

export default as("button")(HiddenShow);
