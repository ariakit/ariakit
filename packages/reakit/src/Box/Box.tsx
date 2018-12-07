import * as React from "react";
import * as PropTypes from "prop-types";
import { theme } from "styled-tools";
import {
  bool,
  bgColorWithProps,
  textColorWithProps
} from "../_utils/styledProps";
import CSSProps from "../_utils/CSSProps";
import applyAllRefs from "../_utils/applyAllRefs";
import pickCSSProps from "../_utils/pickCSSProps";
import dedupeClassName from "../_utils/dedupeClassName";
import pickHTMLProps from "../_utils/pickHTMLProps";
import { Omit } from "../_utils/types";
import styled from "../styled";
import use from "../use";

type CSSProperties = { [K in keyof typeof CSSProps]?: string | number };

export type BoxProps = Omit<React.HTMLProps<any>, "as"> &
  CSSProperties & {
    use?: keyof JSX.IntrinsicElements | React.ComponentType<any>;
    children?: React.ReactNode;
    static?: boolean;
    absolute?: boolean;
    fixed?: boolean;
    relative?: boolean;
    sticky?: boolean;
    opaque?: boolean;
    palette?: string;
    tone?: number;
    elementRef?: React.Ref<any>;
  };

const BoxComponent = React.forwardRef<HTMLElement, BoxProps>(
  ({ use: T, ...props }, ref) => {
    if (!T) return null;

    const style = pickCSSProps(props);

    if (typeof T === "string") {
      const className = dedupeClassName(props.className);
      const allProps = Object.assign(
        pickHTMLProps(props),
        { className },
        style ? { style } : {}
      );
      return <T {...allProps} ref={applyAllRefs(ref, props.elementRef)} />;
    }
    return (
      <T {...props} ref={applyAllRefs(ref, props.elementRef)} style={style} />
    );
  }
);

const positions = ["static", "absolute", "fixed", "relative", "sticky"];

const Box = styled(BoxComponent)`
  margin: unset;
  padding: unset;
  border: unset;
  background: unset;
  font: unset;
  font-family: inherit;
  font-size: 100%;
  box-sizing: border-box;
  background-color: ${bgColorWithProps};
  color: ${textColorWithProps};

  &:focus:not(:focus-visible) {
    outline: none;
  }

  ${theme("Box")};
  &&& {
    ${bool("position", positions)};
  }
`;

const useTypes = [PropTypes.func, PropTypes.string, PropTypes.object];

// @ts-ignore
Box.propTypes = {
  use: PropTypes.oneOfType([
    ...useTypes,
    PropTypes.arrayOf(PropTypes.oneOfType(useTypes))
  ]),
  opaque: PropTypes.bool,
  palette: PropTypes.string,
  tone: PropTypes.number,
  static: PropTypes.bool,
  absolute: PropTypes.bool,
  fixed: PropTypes.bool,
  relative: PropTypes.bool,
  sticky: PropTypes.bool
};

export default use(Box, "div");
