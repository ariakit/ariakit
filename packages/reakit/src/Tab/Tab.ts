import { mergeProps } from "../utils/mergeProps";
import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useProps } from "../system/useProps";
import { RoverOptions, RoverProps, useRover } from "../Rover/Rover";
import { Keys } from "../__utils/types";
import { unstable_useOptions } from "../system";
import { getTabId, getTabPanelId } from "./__utils";
import { useTabState, TabStateReturn } from "./TabState";

export type TabOptions = RoverOptions &
  Pick<Partial<TabStateReturn>, "unstable_manual"> &
  Pick<
    TabStateReturn,
    "unstable_baseId" | "unstable_selectedId" | "unstable_select"
  > & {
    /** TODO: Description */
    stopId: string;
  };

export type TabProps = RoverProps;

export function useTab(
  { unstable_focusable = true, ...options }: TabOptions,
  htmlProps: TabProps = {}
) {
  let _options: TabOptions = { unstable_focusable, ...options };
  _options = unstable_useOptions("useTab", _options, htmlProps);

  const selected = _options.unstable_selectedId === _options.stopId;

  htmlProps = mergeProps(
    {
      role: "tab",
      id: getTabId(_options.stopId, _options.unstable_baseId),
      "aria-selected": selected,
      "aria-controls": getTabPanelId(_options.stopId, _options.unstable_baseId),
      onClick: () => {
        if (!_options.disabled && !selected) {
          _options.unstable_select(_options.stopId);
        }
      },
      onFocus: () => {
        if (!_options.disabled && !_options.unstable_manual && !selected) {
          _options.unstable_select(_options.stopId);
        }
      }
    } as typeof htmlProps,
    htmlProps
  );

  htmlProps = useRover(_options, htmlProps);
  htmlProps = unstable_useProps("useTab", _options, htmlProps);
  return htmlProps;
}

const keys: Keys<TabStateReturn & TabOptions> = [
  ...useRover.__keys,
  ...useTabState.__keys,
  "stopId"
];

useTab.__keys = keys;

export const Tab = unstable_createComponent({ as: "button", useHook: useTab });
