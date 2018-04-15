import React from "react";
import { ifProp } from "styled-tools";
import { Hidden, Arrow, Perpendicular, keyframes } from "reas";

const animation = keyframes`
  0% { transform: translateY(0) }
  40% { transform: translateY(30px) }
  100% { transform: translateY(0) }
`;

const Text = Hidden.extend`
  position: absolute;
  color: #999;
  animation: 1s infinite ${animation} ease-in-out;
  display: block !important;
  font-size: 14px;
  opacity: 1;
  transition: 200ms opacity ease-in-out;
  ${ifProp({ visible: false }, "opacity: 0")};
  @media (max-width: 768px) {
    display: none !important;
  }
`;

const BoxCall = props => (
  <Hidden.State initialState={{ visible: true }} context="homeBox">
    {hidden => (
      <Text relative {...hidden} {...props}>
        open the box
        <Arrow
          as={Perpendicular}
          pos="bottom"
          color="transparent"
          border="1px solid #999999"
          borderTop="none"
        />
      </Text>
    )}
  </Hidden.State>
);

export default BoxCall;
