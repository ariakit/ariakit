import React from "react";
import PropTypes from "prop-types";
import { theme } from "styled-tools";
import styled from "../styled";
import as from "../as";
import HiddenHide from "../Hidden/HiddenHide";

const Component = props => (
  <HiddenHide
    aria-expanded={props.visible}
    aria-controls={props.popoverId}
    aria-haspopup
    {...props}
  />
);

const PopoverHide = styled(Component)`
  ${theme("PopoverHide")};
`;

PopoverHide.propTypes = {
  popoverId: PropTypes.string,
  visible: PropTypes.bool
};

export default as("button")(PopoverHide);
