import * as React from "react";
import * as PropTypes from "prop-types";
import { theme } from "styled-tools";
import styled from "../styled";
import as from "../as";
import HiddenShow, { HiddenShowProps } from "../Hidden/HiddenShow";
import { PopoverComponentProps, ExcludedHiddenProps } from "./types";

export type PopoverShowProps = Exclude<HiddenShowProps, ExcludedHiddenProps> &
  PopoverComponentProps;

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

export default as("button")(PopoverShow);
