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
  Pick<TabStateReturn, "baseId" | "selectedId" | "select">;

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
    const stopId = options.stopId || options.id || htmlProps.id;
    const selected = options.selectedId === stopId;

    const onClick = React.useCallback(() => {
      if (stopId && !options.disabled && !selected) {
        options.select(stopId);
      }
    }, [options.disabled, selected, options.select, stopId]);

    const onFocus = React.useCallback(() => {
      if (stopId && !options.disabled && !options.manual && !selected) {
        options.select(stopId);
      }
    }, [options.disabled, options.manual, selected, options.select, stopId]);

    return {
      role: "tab",
      id: getTabId(stopId, options.baseId),
      "aria-selected": selected,
      "aria-controls": getTabPanelId(stopId, options.baseId),
      onClick: useAllCallbacks(onClick, htmlOnClick),
      onFocus: useAllCallbacks(onFocus, htmlOnFocus),
      ...htmlProps
    };
  }
});

export const Tab = createComponent({ as: "button", useHook: useTab });
