import React from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import styled, { css } from "styled-components";
import { switchProp, prop, ifProp, ifNotProp, withProp } from "styled-tools";
import { hasTransition, expandWithProps } from "../../utils/transform";
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

class Component extends React.Component {
  componentDidMount() {
    this.align();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.alignWith !== this.props.alignWith) {
      this.align();
    }
  }

  align() {
    const { alignWith, alignOffset } = this.props;
    if (!alignWith) return;
    const target =
      typeof alignWith === "string"
        ? document.getElementById(alignWith)
        : ReactDOM.findDOMNode(alignWith);

    const current = ReactDOM.findDOMNode(this);
    const { top, left, width, height } = target.getBoundingClientRect();
    const parent = current.parentNode.getBoundingClientRect();

    if (isVertical(this.props)) {
      current.style.top = `calc(${top -
        parent.top +
        height / 2 +
        current.parentNode.clientHeight / 2}px + ${numberToPx(alignOffset)})`;
    } else {
      current.style.left = `calc(${left -
        parent.left +
        width / 2 +
        current.parentNode.clientWidth / 2}px + ${numberToPx(alignOffset)})`;
    }
  }

  render() {
    return <Base {...this.props} />;
  }
}

const Perpendicular = styled(Component)`
  position: absolute;
  ${opposite}: calc(100% + ${withProp("gutter", numberToPx)});
  transform: ${transform()};

  ${ifNotProp(
    "alignWith",
    switchProp("align", {
      start: css`
        ${perpendicular}: ${withProp("alignOffset", numberToPx)};
      `,
      center: css`
        ${perpendicular}: calc(50% + ${withProp("alignOffset", numberToPx)});
      `,
      end: css`
        ${perpendicularOpposite}: ${withProp("alignOffset", numberToPx)};
      `
    })
  )};

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
          ${expandWithProps} !important;
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
