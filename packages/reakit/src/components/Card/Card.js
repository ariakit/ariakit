import styled from "styled-components";
import PropTypes from "prop-types";
import { prop, withProp } from "styled-tools";
import as from "../../enhancers/as";
import numberToPx from "../../utils/numberToPx";
import Base from "../Base";
import CardFit from "./CardFit";

const Card = styled(Base)`
  position: relative;
  display: inline-block;
  background-color: white;

  && > *:not(${CardFit}) {
    margin: ${withProp("gutter", numberToPx)};
  }

  ${prop("theme.Card")};
`;

Card.propTypes = {
  gutter: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
};

Card.defaultProps = {
  gutter: "1rem"
};

export default as("div")(Card);
