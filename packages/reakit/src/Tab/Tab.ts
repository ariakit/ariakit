import * as React from "react";
import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { useAllCallbacks } from "reakit-utils/useAllCallbacks";
import { RoverOptions, RoverHTMLProps, useRover } from "../Rover/Rover";
import { getTabId, getTabPanelId } from "./__utils";
import { useTabState, TabStateReturn } from "./TabState";

export type TabOptions = RoverOptions &
  Pick<Required<RoverOptions>, "stopId"> &
  Pick<Partial<TabStateReturn>, "manual"> &
  Pick<TabStateReturn, "unstable_baseId" | "selectedId" | "select">;

export type TabHTMLProps = RoverHTMLProps;

export type TabProps = TabOptions & TabHTMLProps;

export const useTab = createHook<TabOptions, TabHTMLProps>({
  name: "Tab",
  compose: useRover,
  useState: useTabState,

  useOptions({ focusable = true, ...options }) {
    return { focusable, ...options };
  },

  useProps(
    options,
    { onClick: htmlOnClick, onFocus: htmlOnFocus, ...htmlProps }
  ) {
    const selected = options.selectedId === options.stopId;

    const onClick = React.useCallback(() => {
      if (!options.disabled && !selected) {
        options.select(options.stopId);
      }
    }, [options.disabled, selected, options.select, options.stopId]);

    const onFocus = React.useCallback(() => {
      if (!options.disabled && !options.manual && !selected) {
        options.select(options.stopId);
      }
    }, [
      options.disabled,
      options.manual,
      selected,
      options.select,
      options.stopId
    ]);

    return {
      role: "tab",
      id: getTabId(options.stopId, options.unstable_baseId),
      "aria-selected": selected,
      "aria-controls": getTabPanelId(options.stopId, options.unstable_baseId),
      onClick: useAllCallbacks(onClick, htmlOnClick),
      onFocus: useAllCallbacks(onFocus, htmlOnFocus),
      ...htmlProps
    };
  }
});

export const Tab = createComponent({ as: "button", useHook: useTab });
