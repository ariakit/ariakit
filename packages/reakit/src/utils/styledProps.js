import kebabCase from "./kebabCase";
import numberToPx from "./numberToPx";

export const bool = (cssProp, validComponentProps) => props => {
  const keys = Object.keys(props)
    .filter(k => validComponentProps.indexOf(k) >= 0)
    .filter(k => !!props[k])
    .map(kebabCase);
  if (keys.length) {
    return `${cssProp}: ${keys.join(" ")};`;
  }
  return "";
};

export const value = (cssProp, componentProp) => props => {
  const v = props[componentProp];
  if (typeof v === "undefined") return "";
  return `${cssProp}: ${numberToPx(v)};`;
};
