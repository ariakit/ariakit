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

export const expand = ifProp(
  { expand: true },
  prop("defaultExpand", "center"),
  prop("expand")
);

export const slide = ifProp(
  { slide: true },
  prop("defaultSlide", "right"),
  prop("slide")
);

export const scaleWithProps = ifProp("expand", "scale(0.01)");

export const originWithProps = withProp(["originX", "originY"], (x, y) =>
  switchProp(
    expand,
    {
      center: origin(calc("50%", x), calc("50%", y)),
      top: origin(calc("50%", x), calc("100%", y)),
      right: origin(x, calc("50%", y)),
      bottom: origin(calc("50%", x), y),
      left: origin(calc("100%", x), calc("50%", y))
    },
    origin(calc("50%", x), calc("50%", y))
  )
);

export const translateWithProps = withProp(
  ["translateX", "translateY"],
  translate3d
);

export const slideWithProps = withProp(
  ["translateX", "translateY", "slideOffset"],
  (x, y, offset = "100%") =>
    switchProp(
      slide,
      {
        top: translate3d(x, calc(offset, y)),
        right: translate3d(calc(minus(offset), x), y),
        bottom: translate3d(x, calc(minus(offset), y)),
        left: translate3d(calc(offset, x), y)
      },
      translate3d(x, y)
    )
);
