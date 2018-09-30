import * as React from "react";
import * as PropTypes from "prop-types";
import { theme } from "styled-tools";
import styled from "../styled";
import as from "../as";
import HiddenHide, { HiddenHideProps } from "../Hidden/HiddenHide";
import { PopoverComponentProps, ExcludedHiddenProps } from "./types";

export type PopoverHideProps = Exclude<HiddenHideProps, ExcludedHiddenProps> &
  PopoverComponentProps;

const PopoverHideComponent = (props: PopoverHideProps) => (
  <HiddenHide
    aria-expanded={props.visible}
    aria-controls={props.popoverId}
    aria-haspopup
    {...props}
  />
);

const PopoverHide = styled(PopoverHideComponent)`
  ${theme("PopoverHide")};
`;

// @ts-ignore
PopoverHide.propTypes = {
  popoverId: PropTypes.string,
  visible: PropTypes.bool
};

export default as("button")(PopoverHide);
