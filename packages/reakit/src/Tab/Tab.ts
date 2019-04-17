import { mergeProps } from "../utils/mergeProps";
import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useProps } from "../system/useProps";
import { RoverOptions, RoverProps, useRover } from "../Rover/Rover";
import { Keys } from "../__utils/types";
import { unstable_useOptions } from "../system";
import { getTabId, getTabPanelId } from "./__utils";
import { useTabState, TabStateReturn } from "./TabState";

export type TabOptions = RoverOptions &
  Pick<Required<RoverOptions>, "stopId"> &
  Pick<Partial<TabStateReturn>, "manual"> &
  Pick<TabStateReturn, "unstable_baseId" | "selectedId" | "select">;

export type TabProps = RoverProps;

export function useTab(
  { focusable = true, ...options }: TabOptions,
  htmlProps: TabProps = {}
) {
  let _options: TabOptions = { focusable, ...options };
  _options = unstable_useOptions("useTab", _options, htmlProps);

  const selected = _options.selectedId === _options.stopId;

  htmlProps = mergeProps(
    {
      role: "tab",
      id: getTabId(_options.stopId, _options.unstable_baseId),
      "aria-selected": selected,
      "aria-controls": getTabPanelId(_options.stopId, _options.unstable_baseId),
      onClick: () => {
        if (!_options.disabled && !selected) {
          _options.select(_options.stopId);
        }
      },
      onFocus: () => {
        if (!_options.disabled && !_options.manual && !selected) {
          _options.select(_options.stopId);
        }
      }
    } as typeof htmlProps,
    htmlProps
  );

  htmlProps = unstable_useProps("useTab", _options, htmlProps);
  htmlProps = useRover(_options, htmlProps);
  return htmlProps;
}

const keys: Keys<TabStateReturn & TabOptions> = [
  ...useRover.__keys,
  ...useTabState.__keys
];

useTab.__keys = keys;

export const Tab = unstable_createComponent({ as: "button", useHook: useTab });
