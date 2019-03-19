import { mergeProps } from "../utils/mergeProps";
import { unstable_createComponent } from "../utils/createComponent";
import { useHook } from "../system/useHook";
import {
  unstable_HiddenOptions,
  unstable_HiddenProps,
  useHidden
} from "../Hidden/Hidden";
import { getTabPanelId, getTabId } from "./__utils";
import { useTabState, unstable_TabStateReturn } from "./TabState";

export type unstable_TabPanelOptions = unstable_HiddenOptions &
  Partial<unstable_TabStateReturn> &
  Pick<unstable_TabStateReturn, "selectedId"> & {
    /** TODO: Description */
    stopId: string;
  };

export type unstable_TabPanelProps = unstable_HiddenProps;

export function useTabPanel(
  options: unstable_TabPanelOptions,
  htmlProps: unstable_TabPanelProps = {}
) {
  const visible = options.selectedId === options.stopId;
  const allOptions = { visible, ...options };

  htmlProps = mergeProps(
    {
      role: "tabpanel",
      tabIndex: 0,
      id: getTabPanelId(options.stopId, options.baseId),
      "aria-labelledby": getTabId(options.stopId, options.baseId)
    } as typeof htmlProps,
    htmlProps
  );
  htmlProps = useHidden(allOptions, htmlProps);
  htmlProps = useHook("useTabPanel", allOptions, htmlProps);
  return htmlProps;
}

const keys: Array<keyof unstable_TabPanelOptions> = [
  ...useHidden.keys,
  ...useTabState.keys,
  "stopId"
];

useTabPanel.keys = keys;

export const TabPanel = unstable_createComponent("div", useTabPanel);
