import * as React from "react";
import * as PropTypes from "prop-types";
import { theme } from "styled-tools";
import callAll from "../_utils/callAll";
import styled from "../styled";
import as from "../as";
import Box from "../Box";

export interface HiddenShowProps {
  show: () => void;
  onClick?: (...args: any[]) => void;
}

const Component = ({ onClick, ...props }: HiddenShowProps) => (
  <Box onClick={callAll(props.show, onClick)} {...props} />
);

const HiddenShow = styled(Component)`
  ${theme("HiddenShow")};
`;

// @ts-ignore
HiddenShow.propTypes = {
  show: PropTypes.func.isRequired,
  onClick: PropTypes.func
};

export default as("button")(HiddenShow);
