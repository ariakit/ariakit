import { unstable_useHook } from "../system/useHook";
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
  htmlProps: unstable_UseTabPanelProps = {}
) {
  htmlProps = mergeProps(
    {
      role: "tabpanel",
      id: unstable_getTabPanelId(options.tabId, options.baseId),
      "aria-labelledby": unstable_getTabId(options.tabId, options.baseId)
    } as typeof htmlProps,
    htmlProps
  );
  htmlProps = useHidden(
    { visible: options.isActive(options.tabId), ...options },
    htmlProps
  );
  htmlProps = unstable_useHook("useTabPanel", options, htmlProps);
  return htmlProps;
}

const keys: Array<keyof unstable_UseTabPanelOptions> = [
  ...useHidden.keys,
  ...useTabState.keys,
  "tabId"
];

useTabPanel.keys = keys;
