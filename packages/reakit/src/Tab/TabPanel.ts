import { mergeProps } from "../utils/mergeProps";
import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useProps } from "../system/useProps";
import { HiddenOptions, HiddenProps, useHidden } from "../Hidden/Hidden";
import { HiddenStateReturn } from "../Hidden/HiddenState";
import { Keys } from "../__utils/types";
import { unstable_useOptions } from "../system";
import { getTabPanelId, getTabId } from "./__utils";
import { useTabState, TabStateReturn } from "./TabState";

export type TabPanelOptions = HiddenOptions &
  Pick<TabStateReturn, "unstable_baseId" | "unstable_selectedId"> & {
    /** TODO: Description */
    stopId: string;
  };

export type TabPanelProps = HiddenProps;

export function useTabPanel(
  options: TabPanelOptions,
  htmlProps: TabPanelProps = {}
) {
  let _options: TabPanelOptions = {
    visible: options.unstable_selectedId === options.stopId,
    ...options
  };
  _options = unstable_useOptions("useTabPanel", _options, htmlProps);

  htmlProps = mergeProps(
    {
      role: "tabpanel",
      tabIndex: 0,
      id: getTabPanelId(options.stopId, options.unstable_baseId),
      "aria-labelledby": getTabId(options.stopId, options.unstable_baseId)
    } as typeof htmlProps,
    htmlProps
  );
  htmlProps = useHidden(_options, htmlProps);
  htmlProps = unstable_useProps("useTabPanel", _options, htmlProps);
  return htmlProps;
}

const keys: Keys<HiddenStateReturn & TabStateReturn & TabPanelOptions> = [
  ...useHidden.__keys,
  ...useTabState.__keys,
  "stopId"
];

useTabPanel.__keys = keys;

export const TabPanel = unstable_createComponent({
  as: "div",
  useHook: useTabPanel
});
