import PropTypes from "prop-types";
import styled, { css } from "styled-components";
import { switchProp, prop, ifProp, withProp } from "styled-tools";
import { hasTransition, expand } from "../../utils/transitions";
import numberToPx from "../../utils/numberToPx";
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

const isVertical = ({ pos }) => pos === "left" || pos === "right";

const rotation = ({ rotate, pos, angle }) => {
  if (!rotate) return null;
  const rotateZ = value => `rotateZ(${value + angle}deg)`;
  const rotations = {
    top: rotateZ(0),
    right: rotateZ(90),
    bottom: rotateZ(180),
    left: rotateZ(270)
  };
  return rotations[pos];
};

const transform = ({ x = "0px", y = "0px" } = {}) =>
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
  ${opposite}: calc(100% + ${withProp("gutter", numberToPx)});
  transform: ${transform()};

  ${switchProp("align", {
    start: css`
      ${perpendicular}: ${withProp("alignOffset", numberToPx)};
    `,
    center: css`
      ${perpendicular}: 50%;
    `,
    end: css`
      ${perpendicularOpposite}: ${withProp("alignOffset", numberToPx)};
    `
  })};

  ${ifProp(
    hasTransition,
    css`
      &[aria-hidden="true"] {
        transform: ${ifProp(
            "slide",
            switchProp(
              "slide",
              {
                top: transform({ y: "1em" }),
                right: transform({ x: "-1em" }),
                bottom: transform({ y: "-1em" }),
                left: transform({ x: "1em" })
              },
              transform({ x: "-1em" })
            ),
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
  alignOffset: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  gutter: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  rotate: PropTypes.bool,
  angle: PropTypes.number
};

Perpendicular.defaultProps = {
  pos: "right",
  align: "center",
  alignOffset: 0,
  gutter: 0,
  angle: 0
};

export default as("div")(Perpendicular);
