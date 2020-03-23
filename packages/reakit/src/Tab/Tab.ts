import * as React from "react";
import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { useAllCallbacks } from "reakit-utils/useAllCallbacks";
import {
  unstable_CompositeItemOptions as CompositeItemOptions,
  unstable_CompositeItemHTMLProps as CompositeItemHTMLProps,
  unstable_useCompositeItem as useCompositeItem
} from "../Composite/CompositeItem";
import { useTabState, TabStateReturn } from "./TabState";

export type TabOptions = CompositeItemOptions &
  Pick<Partial<TabStateReturn>, "manual"> &
  Pick<TabStateReturn, "panels" | "selectedId" | "select">;

export type TabHTMLProps = CompositeItemHTMLProps;

export type TabProps = TabOptions & TabHTMLProps;

function getTabPanelId(options: TabOptions) {
  return (
    options.panels?.find(panel => panel.groupId === options.id)?.id || undefined
  );
}

export const useTab = createHook<TabOptions, TabHTMLProps>({
  name: "Tab",
  compose: useCompositeItem,
  useState: useTabState,

  useOptions({ focusable = true, ...options }) {
    return { focusable, id: options.stopId, ...options };
  },

  useProps(
    options,
    { onClick: htmlOnClick, onFocus: htmlOnFocus, ...htmlProps }
  ) {
    const selected = options.selectedId === options.id;

    const onClick = React.useCallback(() => {
      if (options.id && !options.disabled && !selected) {
        options.select?.(options.id);
      }
    }, [options.disabled, selected, options.select, options.id]);

    const onFocus = React.useCallback(() => {
      if (options.id && !options.disabled && !options.manual && !selected) {
        options.select?.(options.id);
      }
    }, [
      options.id,
      options.disabled,
      options.manual,
      selected,
      options.select
    ]);

    return {
      role: "tab",
      "aria-selected": selected,
      "aria-controls": getTabPanelId(options),
      onClick: useAllCallbacks(onClick, htmlOnClick),
      onFocus: useAllCallbacks(onFocus, htmlOnFocus),
      ...htmlProps
    };
  }
});

export const Tab = createComponent({ as: "button", useHook: useTab });
