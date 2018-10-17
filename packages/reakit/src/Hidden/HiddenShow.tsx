import * as React from "react";
import * as PropTypes from "prop-types";
import { theme } from "styled-tools";
import callAll from "../_utils/callAll";
import styled from "../styled";
import Box, { BoxProps } from "../Box";
import { HiddenContainerActions } from "./HiddenContainer";

export interface HiddenShowProps extends BoxProps {
  show: HiddenContainerActions["show"];
  onClick?: React.MouseEventHandler;
}

const HiddenShowComponent = ({ onClick, ...props }: HiddenShowProps) => (
  <Box onClick={callAll(props.show, onClick)} {...props} />
);

const HiddenShow = styled(HiddenShowComponent)`
  ${theme("HiddenShow")};
`;

// @ts-ignore
HiddenShow.propTypes = {
  use: "button",
  show: PropTypes.func.isRequired,
  onClick: PropTypes.func
};

export default HiddenShow;
