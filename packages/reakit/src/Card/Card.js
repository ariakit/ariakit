import PropTypes from "prop-types";
import { theme, withProp } from "styled-tools";
import numberToPx from "../_utils/numberToPx";
import styled from "../styled";
import as from "../as";
import Base from "../Base";
import CardFit from "./CardFit";

const Card = styled(Base)`
  position: relative;
  display: inline-block;

  && > *:not(${CardFit}) {
    margin: ${withProp("gutter", numberToPx)};
  }

  ${theme("Card")};
`;

Card.propTypes = {
  gutter: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
};

Card.defaultProps = {
  gutter: "1rem"
};

export default as("div")(Card);
