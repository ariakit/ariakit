import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { HiddenOptions, HiddenHTMLProps, useHidden } from "../Hidden/Hidden";
import { getTabPanelId, getTabId } from "./__utils";
import { useTabState, TabStateReturn } from "./TabState";

export type TabPanelOptions = HiddenOptions &
  Pick<TabStateReturn, "unstable_baseId" | "selectedId"> & {
    /**
     * Tab's `stopId`.
     */
    stopId: string;
  };

export type TabPanelHTMLProps = HiddenHTMLProps;

export type TabPanelProps = TabPanelOptions & TabPanelHTMLProps;

export const useTabPanel = createHook<TabPanelOptions, TabPanelHTMLProps>({
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
    return {
      role: "tabpanel",
      tabIndex: 0,
      id: getTabPanelId(options.stopId, options.unstable_baseId),
      "aria-labelledby": getTabId(options.stopId, options.unstable_baseId),
      ...htmlProps
    };
  }
});

export const TabPanel = createComponent({
  as: "div",
  useHook: useTabPanel
});
