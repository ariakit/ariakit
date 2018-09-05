import * as React from "react";
import * as PropTypes from "prop-types";
import { prop } from "styled-tools";
import callAll from "../_utils/callAll";
import styled from "../styled";
import as from "../as";
import Base from "../Base";

type ComponentProps = {
  show: () => void;
  onClick?: (...args: any[]) => void;
};

const Component = ({ onClick, ...props }: ComponentProps) => (
  <Base onClick={callAll(props.show, onClick)} {...props} />
);

const HiddenShow = styled(Component)`
  ${prop("theme.HiddenShow")};
`;

// @ts-ignore
HiddenShow.propTypes = {
  show: PropTypes.func.isRequired,
  onClick: PropTypes.func
};

export default as("button")<ComponentProps>(HiddenShow);
