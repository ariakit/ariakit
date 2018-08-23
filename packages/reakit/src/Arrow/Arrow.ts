import * as PropTypes from "prop-types";
import { prop } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Base from "../Base";

const SQRT2 = 1.41421356237;

interface ArrowProps {
  angle?: number;
}

const Arrow = styled(Base)<ArrowProps>`
  display: inline-flex;
  width: 1em;
  height: 1em;
  overflow: hidden;
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
    border-top-width: 0;
    border-left-width: 0;
    margin-bottom: 100%;
    width: calc(100% / ${SQRT2});
    height: calc(100% / ${SQRT2});
    transform: rotateZ(45deg);
  }

  ${prop("theme.Arrow")};
`;

// @ts-ignore
Arrow.propTypes = {
  angle: PropTypes.number
};

Arrow.defaultProps = {
  angle: 0
};

export default as("div")(Arrow);
