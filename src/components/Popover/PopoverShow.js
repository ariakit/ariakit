import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { prop } from "styled-tools";
import as from "../../enhancers/as";
import HiddenShow from "../Hidden/HiddenShow";

const Component = props => (
  <HiddenShow
    aria-expanded={props.visible}
    aria-controls={props.popoverId}
    aria-haspopup
    {...props}
  />
);

const PopoverShow = styled(Component)`
  ${prop("theme.PopoverShow")};
`;

PopoverShow.propTypes = {
  popoverId: PropTypes.string,
  visible: PropTypes.bool
};

export default as("button")(PopoverShow);
