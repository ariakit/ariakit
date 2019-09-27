import * as React from "react";
import { As } from "reakit-utils/types";
import { isRenderProp } from "./__utils/isRenderProp";
import { SystemContext } from "./SystemContext";

export const useCreateElement = <T extends As>(
  type: T,
  props: Record<string, any>,
  children: React.ReactNode = props.children
): JSX.Element => {
  const context = React.useContext(SystemContext);

  if (context.useCreateElement) {
    return context.useCreateElement(type, props, children);
  }

  if (isRenderProp(children)) {
    const { children: _, ...rest } = props;
    return children(rest);
  }

  return React.createElement(type, props, children);
};
