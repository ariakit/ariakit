import * as React from "react";
import { mergeProps } from "../utils/mergeProps";
import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useHook } from "../system/useHook";
import { unstable_BoxOptions, unstable_BoxProps, useBox } from "../box/Box";
import { useTabState, unstable_TabStateReturn } from "./useTabState";
import { unstable_getTabId, unstable_getTabPanelId } from "./utils";

export type unstable_TabOptions = unstable_BoxOptions &
  Partial<unstable_TabStateReturn> &
  Pick<
    unstable_TabStateReturn,
    | "baseId"
    | "isActive"
    | "register"
    | "unregister"
    | "goto"
    | "previous"
    | "next"
  > & {
    /** TODO: Description */
    tabId: string;
    /** TODO: Description */
    order?: number;
  };

export type unstable_TabProps = unstable_BoxProps & React.LiHTMLAttributes<any>;

export function useTab(
  options: unstable_TabOptions,
  htmlProps: unstable_TabProps = {}
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
  }, [active]);

  htmlProps = mergeProps(
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
    } as typeof htmlProps,
    htmlProps
  );

  htmlProps = useBox(options, htmlProps);
  htmlProps = unstable_useHook("useTab", options, htmlProps);
  return htmlProps;
}

const keys: Array<keyof unstable_TabOptions> = [
  ...useBox.keys,
  ...useTabState.keys,
  "tabId",
  "order"
];

useTab.keys = keys;

export const Tab = unstable_createComponent("li", useTab);
