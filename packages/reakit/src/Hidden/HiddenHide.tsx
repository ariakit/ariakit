import * as React from "react";
import * as PropTypes from "prop-types";
import { prop } from "styled-tools";
import callAll from "../_utils/callAll";
import styled from "../styled";
import as from "../as";
import Base from "../Base";

type ComponentProps = {
  hide: () => void;
  onClick?: (...args: any[]) => void;
};

const Component = ({ onClick, ...props }: ComponentProps) => (
  <Base onClick={callAll(props.hide, onClick)} {...props} />
);

const HiddenHide = styled(Component)`
  ${prop("theme.HiddenHide")};
`;

// @ts-ignore
HiddenHide.propTypes = {
  hide: PropTypes.func.isRequired,
  onClick: PropTypes.func
};

export default as("button")<ComponentProps>(HiddenHide);
