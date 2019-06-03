import * as React from "react";
import { unstable_SystemContext } from "reakit/system/SystemContext";
import { As } from "./types";
import { isRenderProp } from "./isRenderProp";

export const useCreateElement = <T extends As>(
  type: T,
  props: Record<string, any>,
  children: React.ReactNode = props.children
): JSX.Element => {
  const context = React.useContext(unstable_SystemContext);

  if (context.useCreateElement) {
    return context.useCreateElement(type, props, children);
  }

  if (isRenderProp(children)) {
    const { children: _, ...rest } = props;
    return children(rest);
  }

  return React.createElement(type, props, children);
};
