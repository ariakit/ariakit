import PropTypes from "prop-types";
import styled from "styled-components";
import { prop } from "styled-tools";
import as from "../../enhancers/as";
import Base from "../Base";

const SQRT2 = 1.41421356237;

const Arrow = styled(Base)`
  display: inline-flex;
  width: 1em;
  height: 1em;
  overflow: hidden;
  color: rgba(0, 0, 0, 0.85);
  align-items: center;
  justify-content: center;
  border-bottom-width: 0 !important;
  border-right-width: 0 !important;
  border-left-width: 0 !important;
  box-sizing: content-box;
  transform: rotateZ(${prop("angle")}deg);

  &:after {
    content: "";
    background-color: currentcolor;
    border: inherit;
    border-width: 1px;
    border-top-width: 0;
    border-left-width: 0;
    margin-bottom: 100%;
    width: calc(100% / ${SQRT2});
    height: calc(100% / ${SQRT2});
    transform: rotateZ(45deg);
  }

  ${prop("theme.Arrow")};
`;

Arrow.propTypes = {
  angle: PropTypes.number
};

Arrow.defaultProps = {
  angle: 0
};

export default as("div")(Arrow);
