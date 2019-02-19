import * as React from "react";
import pickHTMLProps from "../_utils/pickHTMLProps";
import isRenderProp from "../_utils/isRenderProp";
import { ComponentPropsWithAs, As } from "../_utils/types";
import { HookContext } from "../theme";

export function useCreateElement({
  as = "div",
  children,
  ...props
}: ComponentPropsWithAs<As> & Record<string, any>) {
  const htmlProps = pickHTMLProps(props);

  // children must not change between function and node between re-renders
  if (isRenderProp(children)) {
    return children(htmlProps);
  }

  const context = React.useContext(HookContext);
  return context.useCreateElement(as, htmlProps, children);
}

export default useCreateElement;
