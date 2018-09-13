import * as React from "react";
import * as PropTypes from "prop-types";
import { theme } from "styled-tools";
import callAll from "../_utils/callAll";
import styled from "../styled";
import as from "../as";
import Box from "../Box";

export interface HiddenToggleProps {
  toggle: () => void;
  onClick?: (...args: any[]) => void;
}

const Component = ({ onClick, ...props }: HiddenToggleProps) => (
  <Box onClick={callAll(props.toggle, onClick)} {...props} />
);

const HiddenToggle = styled(Component)`
  ${theme("HiddenToggle")};
`;

// @ts-ignore
HiddenToggle.propTypes = {
  toggle: PropTypes.func.isRequired,
  onClick: PropTypes.func
};

export default as("button")(HiddenToggle);
