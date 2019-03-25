import { mergeProps } from "../utils/mergeProps";
import { unstable_createComponent } from "../utils/createComponent";
import { useHook } from "../system/useHook";
import {
  unstable_RoverOptions,
  unstable_RoverProps,
  useRover
} from "../Rover/Rover";
import { Keys } from "../__utils/types";
import { getTabId, getTabPanelId } from "./__utils";
import { useTabState, unstable_TabStateReturn } from "./TabState";

export type unstable_TabOptions = unstable_RoverOptions &
  Partial<unstable_TabStateReturn> &
  Pick<
    unstable_TabStateReturn,
    "unstable_baseId" | "unstable_selectedId" | "unstable_select"
  > & {
    /** TODO: Description */
    stopId: string;
  };

export type unstable_TabProps = unstable_RoverProps;

export function useTab(
  { unstable_focusable = true, ...options }: unstable_TabOptions,
  htmlProps: unstable_TabProps = {}
) {
  const allOptions: unstable_TabOptions = { unstable_focusable, ...options };
  const selected = options.unstable_selectedId === options.stopId;

  htmlProps = mergeProps(
    {
      role: "tab",
      id: getTabId(options.stopId, options.unstable_baseId),
      "aria-selected": selected,
      "aria-controls": getTabPanelId(options.stopId, options.unstable_baseId),
      onClick: () => {
        if (!options.disabled && !selected) {
          options.unstable_select(options.stopId);
        }
      },
      onFocus: () => {
        if (!options.disabled && !options.unstable_manual && !selected) {
          options.unstable_select(options.stopId);
        }
      }
    } as typeof htmlProps,
    htmlProps
  );

  htmlProps = useRover(allOptions, htmlProps);
  htmlProps = useHook("useTab", allOptions, htmlProps);
  return htmlProps;
}

const keys: Keys<unstable_TabOptions> = [
  ...useRover.__keys,
  ...useTabState.__keys,
  "stopId"
];

useTab.__keys = keys;

export const Tab = unstable_createComponent({ as: "button", useHook: useTab });
