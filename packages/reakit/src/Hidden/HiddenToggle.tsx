import * as React from "react";
import * as PropTypes from "prop-types";
import { theme } from "styled-tools";
import hoist from "../_utils/hoist";
import callAll from "../_utils/callAll";
import styled from "../styled";
import use from "../use";
import Box, { BoxProps } from "../Box";
import { HiddenContainerActions } from "./HiddenContainer";

export interface HiddenToggleProps extends BoxProps {
  toggle: HiddenContainerActions["toggle"];
}

const HiddenToggleComponent = React.forwardRef<HTMLElement, HiddenToggleProps>(
  ({ onClick, ...props }, ref) => (
    <Box onClick={callAll(props.toggle, onClick)} {...props} ref={ref} />
  )
);

const HiddenToggle = styled(hoist(HiddenToggleComponent, Box))`
  ${theme("HiddenToggle")};
`;

// @ts-ignore
HiddenToggle.propTypes = {
  toggle: PropTypes.func.isRequired,
  onClick: PropTypes.func
};

export default use(HiddenToggle, "button");
