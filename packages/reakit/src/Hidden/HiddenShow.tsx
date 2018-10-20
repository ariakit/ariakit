import * as React from "react";
import * as PropTypes from "prop-types";
import { theme } from "styled-tools";
import hoist from "../_utils/hoist";
import callAll from "../_utils/callAll";
import styled from "../styled";
import use from "../use";
import Box, { BoxProps } from "../Box";
import { HiddenContainerActions } from "./HiddenContainer";

export interface HiddenShowProps extends BoxProps {
  show: HiddenContainerActions["show"];
  onClick?: React.MouseEventHandler;
}

const HiddenShowComponent = ({ onClick, ...props }: HiddenShowProps) => (
  <Box onClick={callAll(props.show, onClick)} {...props} />
);

const HiddenShow = styled(hoist(HiddenShowComponent, Box))`
  ${theme("HiddenShow")};
`;

// @ts-ignore
HiddenShow.propTypes = {
  show: PropTypes.func.isRequired,
  onClick: PropTypes.func
};

export default use(HiddenShow, "button");
