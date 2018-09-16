import * as React from "react";
import * as PropTypes from "prop-types";
import { theme } from "styled-tools";
import callAll from "../_utils/callAll";
import styled from "../styled";
import as from "../as";
import Box from "../Box";
import { Next, HasNext } from "./StepContainer";

interface StepNext {
  next: Next;
  hasNext?: HasNext;
  loop?: boolean;
  onClick?: () => any;
}

const Component: React.SFC<StepNext> = ({ onClick, ...props }) => (
  <Box
    onClick={callAll(props.next, onClick)}
    disabled={!props.loop && props.hasNext && !props.hasNext()}
    {...props}
  />
);

const StepNext = styled(Component)`
  ${theme("StepNext")};
`;

// @ts-ignore
StepNext.propTypes = {
  next: PropTypes.func.isRequired,
  hasNext: PropTypes.func,
  loop: PropTypes.bool,
  onClick: PropTypes.func
};

export default as("button")(StepNext);
