import * as React from "react";
import * as PropTypes from "prop-types";
import { theme } from "styled-tools";
import styled from "../styled";
import HiddenToggle, { HiddenToggleProps } from "../Hidden/HiddenToggle";

export interface PopoverToggleProps extends HiddenToggleProps {
  popoverId?: string;
  visible?: boolean;
}

const PopoverToggleComponent = (props: PopoverToggleProps) => (
  <HiddenToggle
    aria-expanded={props.visible}
    aria-controls={props.popoverId}
    aria-haspopup
    {...props}
  />
);

const PopoverToggle = styled(PopoverToggleComponent)`
  ${theme("PopoverToggle")};
`;

// @ts-ignore
PopoverToggle.propTypes = {
  popoverId: PropTypes.string,
  visible: PropTypes.bool
};

export default PopoverToggle;
