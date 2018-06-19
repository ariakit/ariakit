import PropTypes from "prop-types";
import styled, { css } from "styled-components";
import { switchProp, prop } from "styled-tools";
import as from "../../enhancers/as";
import Base from "../Base";

const opposites = {
  top: "bottom",
  right: "left",
  bottom: "top",
  left: "right"
};

const opposite = ({ pos }) => opposites[pos];

const perpendicular = ({ pos }) =>
  pos === "left" || pos === "right" ? "top" : "left";

const perpendicularOpposite = props => opposites[perpendicular(props)];

const perpendicularAxis = ({ pos }) =>
  pos === "left" || pos === "right" ? "Y" : "X";

const rotation = ({ rotate, pos, reverse }) => {
  if (!rotate) return null;
  const rotateZ = value => `rotateZ(${reverse ? value + 180 : value}deg)`;
  const rotations = {
    top: rotateZ(0),
    right: rotateZ(90),
    bottom: rotateZ(180),
    left: rotateZ(270)
  };
  return rotations[pos];
};

const Perpendicular = styled(Base)`
  position: absolute;
  ${opposite}: calc(100% + ${prop("gutter")});
  transform: ${rotation};

  ${switchProp("align", {
    start: css`
      ${perpendicular}: 0;`,
    center: css`
      ${perpendicular}: 50%;
      transform: translate${perpendicularAxis}(-50%) ${rotation};`,
    end: css`
      ${perpendicularOpposite}: 0;`
  })};

  ${prop("theme.Perpendicular")};
`;

Perpendicular.propTypes = {
  pos: PropTypes.oneOf(["top", "right", "bottom", "left"]),
  align: PropTypes.oneOf(["start", "center", "end"]),
  gutter: PropTypes.string,
  rotate: PropTypes.bool,
  reverse: PropTypes.bool
};

Perpendicular.defaultProps = {
  pos: "right",
  align: "center",
  gutter: "0.75rem"
};

export default as("div")(Perpendicular);
