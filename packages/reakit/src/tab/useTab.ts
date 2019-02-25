import * as React from "react";
import { unstable_useHook } from "../theme/useHook";
import { mergeProps } from "../utils/mergeProps";
import {
  unstable_UseBoxOptions,
  unstable_UseBoxProps,
  useBox
} from "../box/useBox";
import {
  useTabState,
  unstable_TabState,
  unstable_TabSelectors,
  unstable_TabActions
} from "./useTabState";
import { unstable_getTabId, unstable_getTabPanelId } from "./utils";

export type unstable_UseTabOptions = unstable_UseBoxOptions &
  Partial<unstable_TabState & unstable_TabSelectors & unstable_TabActions> &
  Pick<unstable_TabState, "baseId"> &
  Pick<unstable_TabSelectors, "isActive"> &
  Pick<
    unstable_TabActions,
    "register" | "unregister" | "goto" | "previous" | "next"
  > & {
    /** TODO: Description */
    tabId: string;
    /** TODO: Description */
    order?: number;
  };

export type unstable_UseTabProps = unstable_UseBoxProps &
  React.LiHTMLAttributes<any>;

export function useTab(
  options: unstable_UseTabOptions,
  props: unstable_UseTabProps = {}
) {
  const ref = React.useRef<HTMLLIElement | null>(null);

  React.useEffect(() => {
    options.register(options.tabId, options.order);
    return () => options.unregister(options.tabId);
  }, [options.register, options.unregister, options.tabId, options.order]);

  const active = options.isActive(options.tabId);

  const show = () => !active && options.goto(options.tabId);

  React.useEffect(() => {
    if (active && ref.current) {
      ref.current.focus();
    }
  }, [active, ref]);

  props = mergeProps(
    {
      role: "tab",
      id: unstable_getTabId(options.tabId, options.baseId),
      ref,
      tabIndex: active ? 0 : -1,
      "aria-selected": active,
      "aria-controls": unstable_getTabPanelId(options.tabId, options.baseId),
      onClick: show,
      onFocus: show,
      onKeyDown: e => {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          options.previous();
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          options.next();
        }
      }
    } as typeof props,
    props
  );

  props = useBox(options, props);
  props = unstable_useHook("useTab", options, props);
  return props;
}

const keys: Array<keyof unstable_UseTabOptions> = [
  ...useBox.keys,
  ...useTabState.keys,
  "tabId",
  "order"
];

useTab.keys = keys;
