import * as React from "react";
import pickHTMLProps from "../_utils/pickHTMLProps";
import { RenderProp } from "../_utils/types";
import isRenderProp from "../_utils/isRenderProp";

export type RenderOptions<T extends React.ReactType, P> = {
  as: T;
  children?: React.ReactNode | RenderProp<React.ComponentProps<T>>;
} & P;

function render<T extends React.ReactType, P>({
  as: T,
  children,
  ...props
}: RenderOptions<T, P>) {
  const htmlProps = pickHTMLProps(props) as React.ComponentProps<T>;

  if (isRenderProp(children)) {
    return children(htmlProps);
  }

  return React.createElement(T, htmlProps, children);
}

export default render;
