import { mergeProps } from "../utils/mergeProps";
import { unstable_createComponent } from "../utils/createComponent";
import { useHook } from "../system/useHook";
import {
  unstable_RoverOptions,
  unstable_RoverProps,
  useRover
} from "../Rover/Rover";
import { getTabId, getTabPanelId } from "./__utils";
import { useTabState, unstable_TabStateReturn } from "./TabState";

export type unstable_TabOptions = unstable_RoverOptions &
  Partial<unstable_TabStateReturn> &
  Pick<unstable_TabStateReturn, "select"> & {
    /** TODO: Description */
    stopId: string;
  };

export type unstable_TabProps = unstable_RoverProps;

export function useTab(
  { focusable = true, ...options }: unstable_TabOptions,
  htmlProps: unstable_TabProps = {}
) {
  const allOptions = { focusable, ...options };
  const selected = options.selectedId === options.stopId;

  htmlProps = mergeProps(
    {
      role: "tab",
      id: getTabId(options.stopId, options.baseId),
      "aria-selected": selected,
      "aria-controls": getTabPanelId(options.stopId, options.baseId),
      onClick: () => {
        if (!options.disabled && !selected) {
          options.select(options.stopId);
        }
      },
      onFocus: () => {
        if (!options.disabled && !options.manual && !selected) {
          options.select(options.stopId);
        }
      }
    } as typeof htmlProps,
    htmlProps
  );

  htmlProps = useRover(allOptions, htmlProps);
  htmlProps = useHook("useTab", allOptions, htmlProps);
  return htmlProps;
}

const keys: Array<keyof unstable_TabOptions> = [
  ...useRover.keys,
  ...useTabState.keys
];

useTab.keys = keys;

export const Tab = unstable_createComponent("button", useTab);
