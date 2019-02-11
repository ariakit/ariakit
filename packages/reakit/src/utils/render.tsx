import * as React from "react";
import pickHTMLProps from "../_utils/pickHTMLProps";
import isRenderProp from "../_utils/isRenderProp";
import {
  ComponentPropsWithAs,
  As,
  HTMLAtttributesWithRef
} from "../_utils/types";

export function render({
  as = "div",
  children,
  ...props
}: ComponentPropsWithAs<As> & Record<string, any>) {
  const htmlProps = pickHTMLProps(props);

  if (isRenderProp(children)) {
    return children(htmlProps);
  }

  return React.createElement(as, htmlProps, children);
}

export default render;
