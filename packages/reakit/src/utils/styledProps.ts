import kebabCase from "./kebabCase";
import numberToPx from "./numberToPx";

export type Props = { [x: string]: any };
export type PropsFn = (props: Props) => any;

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
