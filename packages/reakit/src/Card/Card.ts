import * as PropTypes from "prop-types";
import { theme, withProp } from "styled-tools";
import numberToPx from "../_utils/numberToPx";
import getSelector from "../getSelector";
import styled from "../styled";
import use from "../use";
import Box, { BoxProps } from "../Box";
import CardFit from "./CardFit";

export interface CardProps extends BoxProps {
  gutter?: number | string;
}

const Card = styled(Box)<CardProps>`
  display: inline-block;

  && > *:not(${getSelector(CardFit)}) {
    margin: ${withProp("gutter", numberToPx)};
  }

  ${theme("Card")};
`;

// @ts-ignore
Card.propTypes = {
  gutter: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
};

Card.defaultProps = {
  gutter: "1rem",
  opaque: true,
  palette: "background",
  tone: -1
};

export default use(Card, "div");
