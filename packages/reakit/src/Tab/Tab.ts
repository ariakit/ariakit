import { mergeProps } from "../utils/mergeProps";
import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useHook } from "../system/useHook";
import {
  unstable_RovingOptions,
  unstable_RovingProps,
  useRoving
} from "../Roving/Roving";
import { useTabState, unstable_TabStateReturn } from "./TabState";
import { unstable_getTabId, unstable_getTabPanelId } from "./utils";

export type unstable_TabOptions = unstable_RovingOptions &
  Partial<unstable_TabStateReturn> & {
    /** TODO: Description */
    refId: string;
  };

export type unstable_TabProps = unstable_RovingProps;

export function useTab(
  options: unstable_TabOptions,
  htmlProps: unstable_TabProps = {}
) {
  const selected = options.selectedRef === options.refId;

  htmlProps = mergeProps(
    {
      role: "tab",
      id: unstable_getTabId(options.refId, options.baseId),
      "aria-selected": selected,
      "aria-controls": unstable_getTabPanelId(options.refId, options.refId)
    } as typeof htmlProps,
    htmlProps
  );

  htmlProps = useRoving({ focusable: true, ...options }, htmlProps);
  htmlProps = unstable_useHook("useTab", options, htmlProps);
  return htmlProps;
}

const keys: Array<keyof unstable_TabOptions> = [
  ...useRoving.keys,
  ...useTabState.keys
];

useTab.keys = keys;

export const Tab = unstable_createComponent("button", useTab);
