import { mergeProps } from "../utils/mergeProps";
import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useHook } from "../system/useHook";
import {
  unstable_RoverOptions,
  unstable_RoverProps,
  useRover
} from "../Rover/Rover";
import { useTabState, unstable_TabStateReturn } from "./TabState";
import { unstable_getTabId, unstable_getTabPanelId } from "./utils";

export type unstable_TabOptions = unstable_RoverOptions &
  Partial<unstable_TabStateReturn> &
  Pick<unstable_TabStateReturn, "select"> & {
    /** TODO: Description */
    refId: string;
  };

export type unstable_TabProps = unstable_RoverProps;

export function useTab(
  { focusable = true, ...options }: unstable_TabOptions,
  htmlProps: unstable_TabProps = {}
) {
  const allOptions = { focusable, ...options };
  const selected = options.selectedRef === options.refId;

  htmlProps = mergeProps(
    {
      role: "tab",
      id: unstable_getTabId(options.refId, options.baseId),
      "aria-selected": selected,
      "aria-controls": unstable_getTabPanelId(options.refId, options.baseId),
      onClick: () => {
        if (!options.disabled && !selected) {
          options.select(options.refId);
        }
      },
      onFocus: () => {
        if (!options.disabled && options.autoSelect && !selected) {
          options.select(options.refId);
        }
      }
    } as typeof htmlProps,
    htmlProps
  );

  htmlProps = useRover(allOptions, htmlProps);
  htmlProps = unstable_useHook("useTab", allOptions, htmlProps);
  return htmlProps;
}

const keys: Array<keyof unstable_TabOptions> = [
  ...useRover.keys,
  ...useTabState.keys
];

useTab.keys = keys;

export const Tab = unstable_createComponent("button", useTab);
