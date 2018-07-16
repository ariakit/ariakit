import PropTypes from "prop-types";
import styled, { css } from "styled-components";
import { switchProp, prop, ifProp } from "styled-tools";
import as from "../../enhancers/as";
import { hasTransition, expand } from "../../utils/transitions";
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

const isVertical = ({ pos }) => pos === "left" || pos === "right";

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

const transform = (x = "0px", y = "0px") =>
  ifProp(
    { align: "center" },
    css`translateX(${ifProp(
      isVertical,
      x,
      `calc(${x} - 50%)`
    )}) translateY(${ifProp(isVertical, `calc(${y} - 50%)`, y)}) ${rotation}`,
    rotation
  );

const Perpendicular = styled(Base)`
  position: absolute;
  ${opposite}: calc(100% + ${prop("gutter")});
  transform: ${transform()};

  ${switchProp("align", {
    start: css`
      ${perpendicular}: 0;
    `,
    center: css`
      ${perpendicular}: 50%;
    `,
    end: css`
      ${perpendicularOpposite}: 0;
    `
  })};

  ${ifProp(
    hasTransition,
    css`
      &[aria-hidden="true"] {
        transform: ${ifProp(
            "slide",
            switchProp("slide", {
              top: transform("0px", "1em"),
              right: transform("-1em"),
              bottom: transform("0px", "-1em"),
              left: transform("1em"),
              true: transform("-1em")
            }),
            transform()
          )}
          ${expand()} !important;
      }
    `
  )};

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
