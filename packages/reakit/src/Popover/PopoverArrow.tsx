import * as React from "react";
import * as PropTypes from "prop-types";
import { prop, theme } from "styled-tools";
import hoistNonReactStatics from "hoist-non-react-statics";
import { bgColorWithProps } from "../_utils/styledProps";
import styled from "../styled";
import as from "../as";
import Box, { BoxProps } from "../Box";

export interface PopoverArrowProps extends BoxProps {
  fillColor?: string;
  strokeColor?: string;
  opaque?: boolean;
  palette?: string;
  tone?: number;
}

const PopoverArrowComponent = (props: PopoverArrowProps) => (
  <Box {...props}>
    <svg viewBox="0 0 30 30">
      <path
        className="stroke"
        d="M23.7,27.1L17,19.9C16.5,19.3,15.8,19,15,19s-1.6,0.3-2.1,0.9l-6.6,7.2C5.3,28.1,3.4,29,2,29h26
        C26.7,29,24.6,28.1,23.7,27.1z"
      />
      <path
        className="fill"
        d="M23,27.8c1.1,1.2,3.4,2.2,5,2.2h2H0h2c1.7,0,3.9-1,5-2.2l6.6-7.2c0.7-0.8,2-0.8,2.7,0L23,27.8L23,27.8z"
      />
    </svg>
  </Box>
);

hoistNonReactStatics(PopoverArrowComponent, Box);

const PopoverArrow = styled(PopoverArrowComponent)`
  position: absolute;
  font-size: 30px;
  width: 1em;
  height: 1em;
  pointer-events: none;
  background-color: transparent;

  & .stroke {
    fill: ${prop("strokeColor")};
  }

  & .fill {
    fill: ${prop("fillColor", bgColorWithProps)};
  }

  [data-placement^="top"] > & {
    top: 100%;
    transform: rotateZ(180deg);
  }

  [data-placement^="right"] > & {
    right: 100%;
    transform: rotateZ(-90deg);
  }

  [data-placement^="bottom"] > & {
    bottom: 100%;
    transform: rotateZ(360deg);
  }

  [data-placement^="left"] > & {
    left: 100%;
    transform: rotateZ(90deg);
  }

  ${theme("PopoverArrow")};
`;

// @ts-ignore
PopoverArrow.propTypes = {
  fillColor: PropTypes.string,
  strokeColor: PropTypes.string
};

PopoverArrow.defaultProps = {
  strokeColor: "transparent",
  opaque: true,
  palette: "white"
};

export default as("div")(PopoverArrow);
