import * as React from "react";
import { As } from "../__utils/types";
import { isRenderProp } from "../__utils/isRenderProp";
import { unstable_SystemContext } from "../system/SystemContext";

export const unstable_useCreateElement = <T extends As>(
  type: T,
  props: Record<string, any>,
  children: React.ReactNode = props.children
): JSX.Element => {
  const context = React.useContext(unstable_SystemContext);

  if (context.useCreateElement) {
    return context.useCreateElement(type, props, children);
  }

  if (isRenderProp(children)) {
    return children(props);
  }

  return React.createElement(type, props, children);
};
