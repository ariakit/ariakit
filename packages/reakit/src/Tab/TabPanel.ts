import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import {
  DisclosureContentOptions,
  DisclosureContentHTMLProps,
  useDisclosureContent
} from "../Disclosure/DisclosureContent";
import { getTabPanelId, getTabId } from "./__utils";
import { useTabState, TabStateReturn } from "./TabState";

export type TabPanelOptions = DisclosureContentOptions &
  Pick<TabStateReturn, "baseId" | "selectedId"> & {
    /**
     * Tab's `stopId`.
     */
    stopId: string;
  };

export type TabPanelHTMLProps = DisclosureContentHTMLProps;

export type TabPanelProps = TabPanelOptions & TabPanelHTMLProps;

export const useTabPanel = createHook<TabPanelOptions, TabPanelHTMLProps>({
  name: "TabPanel",
  compose: useDisclosureContent,
  useState: useTabState,
  keys: ["stopId"],

  useOptions(options) {
    return {
      visible: options.selectedId === options.stopId,
      ...options,
      unstable_setBaseId: undefined
    };
  },

  useProps(options, htmlProps) {
    return {
      role: "tabpanel",
      tabIndex: 0,
      id: getTabPanelId(options.stopId, options.baseId),
      "aria-labelledby": getTabId(options.stopId, options.baseId),
      ...htmlProps
    };
  }
});

export const TabPanel = createComponent({
  as: "div",
  useHook: useTabPanel
});
