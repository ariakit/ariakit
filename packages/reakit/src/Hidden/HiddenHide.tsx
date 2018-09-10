import * as React from "react";
import * as PropTypes from "prop-types";
import { theme } from "styled-tools";
import callAll from "../_utils/callAll";
import styled from "../styled";
import as from "../as";
import Box from "../Box";

export interface HiddenHideProps {
  hide: () => void;
  onClick?: (...args: any[]) => void;
}

const Component = ({ onClick, ...props }: HiddenHideProps) => (
  <Box onClick={callAll(props.hide, onClick)} {...props} />
);

const HiddenHide = styled(Component)`
  ${theme("HiddenHide")};
`;

// @ts-ignore
HiddenHide.propTypes = {
  hide: PropTypes.func.isRequired,
  onClick: PropTypes.func
};

export default as("button")(HiddenHide);
