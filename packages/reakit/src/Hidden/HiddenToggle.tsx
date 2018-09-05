import * as React from "react";
import * as PropTypes from "prop-types";
import { prop } from "styled-tools";
import callAll from "../_utils/callAll";
import styled from "../styled";
import as from "../as";
import Base from "../Base";

type ComponentProps = {
  toggle: () => void;
  onClick?: (...args: any[]) => void;
};

const Component = ({ onClick, ...props }: ComponentProps) => (
  <Base onClick={callAll(props.toggle, onClick)} {...props} />
);

const HiddenToggle = styled(Component)`
  ${prop("theme.HiddenToggle")};
`;

// @ts-ignore
HiddenToggle.propTypes = {
  toggle: PropTypes.func.isRequired,
  onClick: PropTypes.func
};

export default as("button")<ComponentProps>(HiddenToggle);
