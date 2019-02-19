import * as React from "react";
import { HTMLAttributesWithRef } from "../_utils/types";
import HookContext from "./HookContext";

export function useThemeHook<
  P extends HTMLAttributesWithRef = HTMLAttributesWithRef
>(hook: string, options: any, props = {} as P): P {
  React.useDebugValue(hook);
  const hooks = React.useContext(HookContext);
  if (hook in hooks) {
    return hooks[hook](options, props);
  }
  return props;
}

export default useThemeHook;
