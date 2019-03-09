import { mergeProps } from "../utils/mergeProps";
import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useHook } from "../system/useHook";
import {
  unstable_HiddenOptions,
  unstable_HiddenProps,
  useHidden
} from "../Hidden/Hidden";
import { useTabState, unstable_TabStateReturn } from "./TabState";
import { unstable_getTabPanelId, unstable_getTabId } from "./utils";

export type unstable_TabPanelOptions = unstable_HiddenOptions &
  Partial<unstable_TabStateReturn> &
  Pick<unstable_TabStateReturn, "baseId" | "isActive"> & {
    /** TODO: Description */
    tabId: string;
  };

export type unstable_TabPanelProps = unstable_HiddenProps;

export function useTabPanel(
  options: unstable_TabPanelOptions,
  htmlProps: unstable_TabPanelProps = {}
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

const keys: Array<keyof unstable_TabPanelOptions> = [
  ...useHidden.keys,
  ...useTabState.keys,
  "tabId"
];

useTabPanel.keys = keys;

export const TabPanel = unstable_createComponent("div", useTabPanel);
