import * as React from "react";
import { isRenderProp } from "../_utils/isRenderProp";
import { HookContext } from "../theme/HookContext";

export const useCreateElement = ((
  type: string,
  props: Record<string, any> = {},
  children: React.ReactNode = props.children
) => {
  const context = React.useContext(HookContext);

  if (context.useCreateElement) {
    return context.useCreateElement(type, props, children);
  }

  if (isRenderProp(children)) {
    return children(props);
  }

  return React.createElement(type, props, children);
}) as typeof React.createElement;
