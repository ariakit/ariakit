import { prop, ifProp, withProp, switchProp } from "styled-tools";
import numberToPx from "./numberToPx";

export const hasTransition = props =>
  Boolean(props.animated || props.fade || props.slide || props.expand);

export const translate3d = (x, y, z) =>
  `translate3d(${numberToPx(x)}, ${numberToPx(y)}, ${numberToPx(z)})`;

export const origin = (x = "center", y = "center") =>
  `${numberToPx(x)} ${numberToPx(y)}`;

export const calc = (a, b) => `calc(${numberToPx(a)} + ${numberToPx(b)})`;

export const minus = v => `-${numberToPx(v)}`;

export const scaleWithProps = ifProp("expand", "scale(0.01)");

export const originWithProps = withProp(
  ["originX", "originY", "defaultExpand"],
  (x, y, defaultExpand = "center") =>
    ifProp(
      "expand",
      switchProp(ifProp({ expand: true }, defaultExpand, prop("expand")), {
        center: origin(calc("50%", x), calc("50%", y)),
        top: origin(calc("50%", x), calc("100%", y)),
        right: origin(x, calc("50%", y)),
        bottom: origin(calc("50%", x), y),
        left: origin(calc("100%", x), calc("50%", y))
      }),
      origin(calc("50%", x), calc("50%", y))
    )
);

export const translateWithProps = withProp(
  ["translateX", "translateY"],
  translate3d
);

export const slideWithProps = withProp(
  ["slideDistance", "translateX", "translateY", "defaultSlide"],
  (distance = "100%", x, y, defaultSlide = "right") =>
    ifProp(
      "slide",
      switchProp(ifProp({ slide: true }, defaultSlide, prop("slide")), {
        top: translate3d(x, calc(distance, y)),
        right: translate3d(calc(minus(distance), x), y),
        bottom: translate3d(x, calc(minus(distance), y)),
        left: translate3d(calc(distance, x), y)
      }),
      translate3d(x, y)
    )
);
