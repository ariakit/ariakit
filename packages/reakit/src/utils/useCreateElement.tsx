import * as React from "react";
import pickHTMLProps from "./pickHTMLProps";
import isRenderProp from "../_utils/isRenderProp";
import { HookContext } from "../theme";

export const useCreateElement = ((
  type: string,
  props: Record<string, any> = {},
  children: React.ReactNode = props.children
) => {
  const context = React.useContext(HookContext);

  if (context.useCreateElement) {
    return context.useCreateElement(type, props, children);
  }

  const htmlProps = pickHTMLProps(props);

  if (isRenderProp(children)) {
    return children(htmlProps);
  }

  return React.createElement(type, htmlProps, children);
}) as typeof React.createElement;

export default useCreateElement;
