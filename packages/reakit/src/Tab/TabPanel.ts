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
  Pick<unstable_TabStateReturn, "selectedRef"> & {
    /** TODO: Description */
    refId: string;
  };

export type unstable_TabPanelProps = unstable_HiddenProps;

export function useTabPanel(
  options: unstable_TabPanelOptions,
  htmlProps: unstable_TabPanelProps = {}
) {
  const visible = options.selectedRef === options.refId;
  const allOptions = { visible, ...options };

  htmlProps = mergeProps(
    {
      role: "tabpanel",
      tabIndex: 0,
      id: unstable_getTabPanelId(options.refId, options.baseId),
      "aria-labelledby": unstable_getTabId(options.refId, options.baseId)
    } as typeof htmlProps,
    htmlProps
  );
  htmlProps = useHidden(allOptions, htmlProps);
  htmlProps = unstable_useHook("useTabPanel", allOptions, htmlProps);
  return htmlProps;
}

const keys: Array<keyof unstable_TabPanelOptions> = [
  ...useHidden.keys,
  ...useTabState.keys,
  "refId"
];

useTabPanel.keys = keys;

export const TabPanel = unstable_createComponent("div", useTabPanel);
