import { mergeProps } from "../utils/mergeProps";
import { unstable_createComponent } from "../utils/createComponent";
import { HiddenOptions, HiddenProps, useHidden } from "../Hidden/Hidden";
import { unstable_createHook } from "../utils/createHook";
import { getTabPanelId, getTabId } from "./__utils";
import { useTabState, TabStateReturn } from "./TabState";

export type TabPanelOptions = HiddenOptions &
  Pick<TabStateReturn, "unstable_baseId" | "selectedId"> & {
    /**
     * Tab's `stopId`.
     */
    stopId: string;
  };

export type TabPanelProps = HiddenProps;

export const useTabPanel = unstable_createHook<TabPanelOptions, TabPanelProps>({
  name: "TabPanel",
  compose: useHidden,
  useState: useTabState,
  keys: ["stopId"],

  useOptions(options) {
    return {
      visible: options.selectedId === options.stopId,
      ...options
    };
  },

  useProps(options, htmlProps) {
    return mergeProps(
      {
        role: "tabpanel",
        tabIndex: 0,
        id: getTabPanelId(options.stopId, options.unstable_baseId),
        "aria-labelledby": getTabId(options.stopId, options.unstable_baseId)
      } as TabPanelProps,
      htmlProps
    );
  }
});

export const TabPanel = unstable_createComponent({
  as: "div",
  useHook: useTabPanel
});
