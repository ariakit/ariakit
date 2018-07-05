import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { prop } from "styled-tools";
import as from "../../enhancers/as";
import HiddenToggle from "../Hidden/HiddenToggle";

const Component = props => (
  <HiddenToggle
    aria-expanded={props.visible}
    aria-controls={props.popoverId}
    aria-haspopup
    {...props}
  />
);

const PopoverToggle = styled(Component)`
  ${prop("theme.PopoverToggle")};
`;

PopoverToggle.propTypes = {
  popoverId: PropTypes.string.isRequired,
  visible: PropTypes.bool
};

export default as("button")(PopoverToggle);
