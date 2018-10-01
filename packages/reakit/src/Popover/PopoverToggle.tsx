import * as React from "react";
import * as PropTypes from "prop-types";
import { theme } from "styled-tools";
import styled from "../styled";
import as from "../as";
import HiddenToggle, { HiddenToggleProps } from "../Hidden/HiddenToggle";
import { PopoverComponentProps, ExcludedHiddenProps } from "./types";

export type PopoverToggleProps = Exclude<
  HiddenToggleProps,
  ExcludedHiddenProps
> &
  PopoverComponentProps;

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

export default as("button")(PopoverToggle);
