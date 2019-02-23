import { useHook } from "../theme/useHook";
import { mergeProps } from "../utils/mergeProps";
import {
  UseHiddenOptions,
  UseHiddenProps,
  useHidden
} from "../hidden/useHidden";
import { useTabState, TabState, TabSelectors, TabActions } from "./useTabState";
import { getTabPanelId, getTabId } from "./utils";

export type UseTabPanelOptions = UseHiddenOptions &
  Partial<TabState & TabSelectors & TabActions> &
  Pick<TabState & TabSelectors, "baseId" | "isActive"> & {
    /** TODO: Description */
    tabId: string;
  };

export type UseTabPanelProps = UseHiddenProps;

export function useTabPanel(
  options: UseTabPanelOptions,
  props: UseTabPanelProps = {}
) {
  props = mergeProps(
    {
      role: "tabpanel",
      id: getTabPanelId(options.tabId, options.baseId),
      "aria-labelledby": getTabId(options.tabId, options.baseId)
    } as typeof props,
    props
  );
  props = useHidden(
    { visible: options.isActive(options.tabId), ...options },
    props
  );
  props = useHook("useTabPanel", options, props);
  return props;
}

const keys: Array<keyof UseTabPanelOptions> = [
  ...useHidden.keys,
  ...useTabState.keys,
  "tabId"
];

useTabPanel.keys = keys;
