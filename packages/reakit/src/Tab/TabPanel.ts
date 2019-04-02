import { mergeProps } from "../utils/mergeProps";
import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useProps } from "../system/useProps";
import {
  unstable_HiddenOptions,
  unstable_HiddenProps,
  useHidden
} from "../Hidden/Hidden";
import { Keys } from "../__utils/types";
import { unstable_useOptions } from "../system";
import { getTabPanelId, getTabId } from "./__utils";
import { useTabState, unstable_TabStateReturn } from "./TabState";

export type unstable_TabPanelOptions = unstable_HiddenOptions &
  Partial<unstable_TabStateReturn> &
  Pick<unstable_TabStateReturn, "unstable_baseId" | "unstable_selectedId"> & {
    /** TODO: Description */
    stopId: string;
  };

export type unstable_TabPanelProps = unstable_HiddenProps;

export function useTabPanel(
  options: unstable_TabPanelOptions,
  htmlProps: unstable_TabPanelProps = {}
) {
  let _options: unstable_TabPanelOptions = {
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

const keys: Keys<unstable_TabPanelOptions> = [
  ...useHidden.__keys,
  ...useTabState.__keys,
  "stopId"
];

useTabPanel.__keys = keys;

export const TabPanel = unstable_createComponent({
  as: "div",
  useHook: useTabPanel
});
