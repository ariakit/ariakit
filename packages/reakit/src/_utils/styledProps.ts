import { withProp, palette, switchProp, ifProp, prop } from "styled-tools";
import kebabCase from "./kebabCase";
import numberToPx from "./numberToPx";

export type PropsFn = (props: { [key: string]: any }) => any;

export const bool = (
  cssProp: string,
  validComponentProps: string[]
): PropsFn => props => {
  const keys = Object.keys(props)
    .filter(k => validComponentProps.indexOf(k) >= 0)
    .filter(k => !!props[k])
    .map(kebabCase);
  if (keys.length) {
    return `${cssProp}: ${keys.join(" ")};`;
  }
  return "";
};

export const value = (
  cssProp: string,
  componentProp: string
): PropsFn => props => {
  const v = props[componentProp];
  if (typeof v === "undefined") return "";
  return `${cssProp}: ${numberToPx(v)};`;
};

export const textColorWithProps = withProp(
  ["opaque", "palette", "tone"],
  (opaque, paletteProp, tone = 0) =>
    palette(opaque ? `${paletteProp}Text` : paletteProp, tone, "inherit")
);

export const bgColorWithProps = withProp(
  ["opaque", "palette", "tone"],
  (opaque, paletteProp, tone = 0) => {
    if (!opaque) {
      return "unset";
    }
    return palette(paletteProp, tone, "unset");
  }
);

interface TransitionProps {
  animated?: boolean;
  fade?: boolean | string;
  slide?: boolean | string;
  expand?: boolean | string;
}

export const hasTransition = (props: TransitionProps) =>
  Boolean(props.animated || props.fade || props.slide || props.expand);

export const translate3d = (
  x?: string | number,
  y?: string | number,
  z?: string | number
) => `translate3d(${numberToPx(x)}, ${numberToPx(y)}, ${numberToPx(z)})`;

export const origin = (
  x: string | number = "center",
  y: string | number = "center"
) => `${numberToPx(x)} ${numberToPx(y)}`;

export const calc = (a?: string | number, b?: string | number) =>
  `calc(${numberToPx(a)} + ${numberToPx(b)})`;

export const minus = (v?: string | number) => `-${numberToPx(v)}`;

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
