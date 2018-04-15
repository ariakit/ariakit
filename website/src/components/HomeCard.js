import React from "react";
import { Block, Arrow, Perpendicular } from "reas";

const HomeCard = ({ arrow, ...props }) => (
  <Block>{arrow && <Arrow as={Perpendicular} />}</Block>
);

export default HomeCard;
