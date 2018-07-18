import { prop, ifProp, switchProp } from "styled-tools";

export const hasTransition = props =>
  Boolean(props.animated || props.fade || props.slide || props.expand);

export const expand = () => ifProp("expand", "scale(0.00001)");

export const origin = ({ x = "0px", y = "0px" } = {}) =>
  ifProp(
    "expand",
    switchProp("expand", {
      true: `calc(50% + ${x}) calc(50% + ${y})`,
      top: `calc(50% + ${x}) calc(100% + ${y})`,
      right: `calc(0px + ${x}) calc(50% + ${y})`,
      bottom: `calc(50% + ${x}) calc(0px + ${y})`,
      left: `calc(100% + ${x}) calc(50% + ${y})`
    }),
    `calc(50% + ${x}) calc(50% + ${y})`
  );

export const slide = ({
  gutter = "100%",
  x = "0px",
  y = "0px",
  defaultValue = "right"
} = {}) =>
  ifProp(
    "slide",
    switchProp(ifProp({ slide: true }, defaultValue, prop("slide")), {
      top: `translateX(${x}) translateY(calc(${gutter} + ${y}))`,
      right: `translateX(calc(-${gutter} + ${x})) translateY(${y})`,
      bottom: `translateX(${x}) translateY(calc(-${gutter} + ${y}))`,
      left: `translateX(calc(${gutter} + ${x})) translateY(${y})`
    }),
    `translateX(${x}) translateY(${y})`
  );
