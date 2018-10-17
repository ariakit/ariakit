import * as React from "react";
import * as PropTypes from "prop-types";
import { theme } from "styled-tools";
import styled from "../styled";
import HiddenShow, { HiddenShowProps } from "../Hidden/HiddenShow";

export interface PopoverShowProps extends HiddenShowProps {
  popoverId?: string;
  visible?: boolean;
}

const PopoverShowComponent = (props: PopoverShowProps) => (
  <HiddenShow
    aria-expanded={props.visible}
    aria-controls={props.popoverId}
    aria-haspopup
    {...props}
  />
);

const PopoverShow = styled(PopoverShowComponent)`
  ${theme("PopoverShow")};
`;

// @ts-ignore
PopoverShow.propTypes = {
  popoverId: PropTypes.string,
  visible: PropTypes.bool
};

export default PopoverShow;
