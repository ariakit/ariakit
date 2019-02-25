import * as React from "react";
import { isRenderProp } from "../__utils/isRenderProp";
import { unstable_HookContext } from "../theme/HookContext";

export const unstable_useCreateElement = ((
  type: string,
  props: Record<string, any> = {},
  children: React.ReactNode = props.children
) => {
  const context = React.useContext(unstable_HookContext);

  if (context.useCreateElement) {
    return context.useCreateElement(type, props, children);
  }

  if (isRenderProp(children)) {
    return children(props);
  }

  return React.createElement(type, props, children);
}) as typeof React.createElement;
