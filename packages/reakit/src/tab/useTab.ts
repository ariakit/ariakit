import * as React from "react";
import { useHook } from "../theme/useHook";
import { mergeProps } from "../utils/mergeProps";
import { useLi } from "../elements";
import { UseBoxOptions, UseBoxProps } from "../box/useBox";
import { useTabState, TabState, TabSelectors, TabActions } from "./useTabState";

export type UseTabOptions = UseBoxOptions &
  Partial<TabState & TabSelectors & TabActions> &
  Pick<TabSelectors, "isActive"> &
  Pick<TabActions, "register" | "unregister" | "goto" | "previous" | "next"> & {
    /** TODO: Description */
    tabId: string;
    /** TODO: Description */
    order?: number;
  };

export type UseTabProps = UseBoxProps & React.LiHTMLAttributes<any>;

export function useTab(options: UseTabOptions, props: UseTabProps) {
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
      id: "TODO",
      ref,
      tabIndex: active ? 0 : -1,
      "aria-selected": active,
      "aria-controls": "TODO",
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

  props = useLi(options, props);
  props = useHook("useTab", options, props);
  return props;
}

const keys: Array<keyof UseTabOptions> = [
  ...useLi.keys,
  ...useTabState.keys,
  "tabId",
  "order"
];

useTab.keys = keys;
