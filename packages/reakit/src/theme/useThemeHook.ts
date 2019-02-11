import * as React from "react";
import HookContext from "./HookContext";
import { HTMLAttributesWithRef } from "../_utils/types";

export function useThemeHook<
  P extends HTMLAttributesWithRef = HTMLAttributesWithRef
>(hook: string, options: any, props = {} as P) {
  const hooks = React.useContext(HookContext);
  if (hook in hooks) {
    return hooks[hook](options, props);
  }
  return props;
}

export default useThemeHook;
