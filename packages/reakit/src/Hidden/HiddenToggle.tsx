import * as React from "react";
import * as PropTypes from "prop-types";
import { theme } from "styled-tools";
import callAll from "../_utils/callAll";
import styled from "../styled";
import as from "../as";
import Box, { BoxProps } from "../Box";
import { HiddenContainerActions } from "./HiddenContainer";

export interface HiddenToggleProps extends BoxProps {
  toggle: HiddenContainerActions["toggle"];
  onClick?: React.MouseEventHandler;
}

const HiddenToggleComponent = ({ onClick, ...props }: HiddenToggleProps) => (
  <Box onClick={callAll(props.toggle, onClick)} {...props} />
);

const HiddenToggle = styled(HiddenToggleComponent)`
  ${theme("HiddenToggle")};
`;

// @ts-ignore
HiddenToggle.propTypes = {
  toggle: PropTypes.func.isRequired,
  onClick: PropTypes.func
};

export default as("button")(HiddenToggle);
