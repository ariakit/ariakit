import { unstable_useHook } from "../theme/useHook";
import { mergeProps } from "../utils/mergeProps";
import {
  unstable_UseHiddenOptions,
  unstable_UseHiddenProps,
  useHidden
} from "../hidden/useHidden";
import {
  useTabState,
  unstable_TabState,
  unstable_TabSelectors,
  unstable_TabActions
} from "./useTabState";
import { unstable_getTabPanelId, unstable_getTabId } from "./utils";

export type unstable_UseTabPanelOptions = unstable_UseHiddenOptions &
  Partial<unstable_TabState & unstable_TabSelectors & unstable_TabActions> &
  Pick<unstable_TabState & unstable_TabSelectors, "baseId" | "isActive"> & {
    /** TODO: Description */
    tabId: string;
  };

export type unstable_UseTabPanelProps = unstable_UseHiddenProps;

export function useTabPanel(
  options: unstable_UseTabPanelOptions,
  props: unstable_UseTabPanelProps = {}
) {
  props = mergeProps(
    {
      role: "tabpanel",
      id: unstable_getTabPanelId(options.tabId, options.baseId),
      "aria-labelledby": unstable_getTabId(options.tabId, options.baseId)
    } as typeof props,
    props
  );
  props = useHidden(
    { visible: options.isActive(options.tabId), ...options },
    props
  );
  props = unstable_useHook("useTabPanel", options, props);
  return props;
}

const keys: Array<keyof unstable_UseTabPanelOptions> = [
  ...useHidden.keys,
  ...useTabState.keys,
  "tabId"
];

useTabPanel.keys = keys;
