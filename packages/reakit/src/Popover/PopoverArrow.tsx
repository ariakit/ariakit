import * as React from "react";
import * as PropTypes from "prop-types";
import { prop, theme, palette } from "styled-tools";
import hoistNonReactStatics from "hoist-non-react-statics";
import styled from "../styled";
import as from "../as";
import Base from "../Base";

interface PopoverArrowProps {
  fillColor?: string;
  strokeColor?: string;
}

const Component = (props: PopoverArrowProps) => (
  <Base {...props}>
    <svg viewBox="0 0 30 30">
      <path
        className="stroke"
        d="M23,26.8c1.1,1.2,3.4,2.2,5,2.2h2H0h2c1.7,0,3.9-1,5-2.2l6.6-7.2c0.7-0.8,2-0.8,2.7,0L23,26.8L23,26.8z"
      />
      <path
        className="fill"
        d="M23,27.8c1.1,1.2,3.4,2.2,5,2.2h2H0h2c1.7,0,3.9-1,5-2.2l6.6-7.2c0.7-0.8,2-0.8,2.7,0L23,27.8L23,27.8z"
      />
    </svg>
  </Base>
);

// @ts-ignore
hoistNonReactStatics(Component, Base);

const PopoverArrow = styled(Component)`
  position: absolute;
  font-size: 30px;
  width: 1em;
  height: 1em;
  pointer-events: none;

  & .stroke {
    fill: ${prop("strokeColor")};
  }

  & .fill {
    fill: ${prop("fillColor", palette("background", -1))};
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
  strokeColor: "transparent"
};

export default as("div")(PopoverArrow);
