import * as React from "react";
import * as PropTypes from "prop-types";
import { theme } from "styled-tools";
import callAll from "../_utils/callAll";
import styled from "../styled";
import Box, { BoxProps } from "../Box";
import { HiddenContainerActions } from "./HiddenContainer";

export interface HiddenHideProps extends BoxProps {
  hide: HiddenContainerActions["hide"];
  onClick?: React.MouseEventHandler;
}

const HiddenHideComponent = ({ onClick, ...props }: HiddenHideProps) => (
  <Box onClick={callAll(props.hide, onClick)} {...props} />
);

const HiddenHide = styled(HiddenHideComponent)`
  ${theme("HiddenHide")};
`;

// @ts-ignore
HiddenHide.propTypes = {
  use: "button",
  hide: PropTypes.func.isRequired,
  onClick: PropTypes.func
};

export default HiddenHide;
