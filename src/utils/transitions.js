import { prop, ifProp, switchProp } from "styled-tools";

export const hasTransition = props =>
  props.animated || props.fade || props.slide || props.expand;

export const expand = () =>
  ifProp(
    "expand",
    switchProp("expand", {
      top: "scaleY(0.0001)",
      right: "scaleX(0.0001)",
      bottom: "scaleY(0.0001)",
      left: "scaleX(0.0001)",
      true: "scale(0.0001)"
    })
  );

export const origin = ({ x = "0px", y = "0px" } = {}) =>
  ifProp(
    "expand",
    switchProp("expand", {
      top: `transform-origin: calc(50% + ${x}) calc(100% + ${y})`,
      right: `transform-origin: calc(0px + ${x}) calc(50% + ${y})`,
      bottom: `transform-origin: calc(50% + ${x}) calc(0px + ${y})`,
      left: `transform-origin: calc(100% + ${x}) calc(50% + ${y})`,
      true: `transform-origin: calc(50% + ${x}) calc(50% + ${y})`
    }),
    `transform-origin: calc(50% + ${x}) calc(50% + ${y})`
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
    `translateX(${x}) translateY(${x})`
  );
