import * as PropTypes from "prop-types";
import { theme, withProp } from "styled-tools";
import numberToPx from "../_utils/numberToPx";
import styled from "../styled";
import as from "../as";
import Base from "../Base";
import CardFit from "./CardFit";

interface CardProps {
  gutter?: number | string;
}

const Card = styled(Base)<CardProps>`
  display: inline-block;

  // @ts-ignore
  && > *:not(${CardFit}) {
    margin: ${withProp("gutter", numberToPx)};
  }

  ${theme("Card")};
`;

// @ts-ignore
Card.propTypes = {
  gutter: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
};

Card.defaultProps = {
  gutter: "1rem"
};

export default as("div")(Card);
