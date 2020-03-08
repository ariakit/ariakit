import * as React from "react";
import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { warning } from "reakit-utils/warning";
import { useForkRef } from "reakit-utils/useForkRef";
import {
  DisclosureContentOptions,
  DisclosureContentHTMLProps,
  useDisclosureContent
} from "../Disclosure/DisclosureContent";
import {
  unstable_useId,
  unstable_IdOptions,
  unstable_IdHTMLProps
} from "../Id/Id";
import { useTabState, TabStateReturn } from "./TabState";

export type TabPanelOptions = DisclosureContentOptions &
  unstable_IdOptions &
  Pick<
    TabStateReturn,
    "selectedId" | "registerPanel" | "unregisterPanel" | "panels" | "items"
  > & {
    /**
     * Tab's `stopId`.
     * @deprecated Use `tabId` instead.
     * @private
     */
    stopId?: string;
    /**
     * Tab's id
     */
    tabId?: string;
  };

export type TabPanelHTMLProps = DisclosureContentHTMLProps &
  unstable_IdHTMLProps;

export type TabPanelProps = TabPanelOptions & TabPanelHTMLProps;

function getTabId({ panels, id, tabId, stopId, items }: TabPanelOptions) {
  const panel = panels?.find(p => p.id === id);
  const maybeId = panel?.groupId || tabId || stopId;
  if (panels && items && panel && !maybeId) {
    const tabIds = panels.map(p => p.groupId).filter(Boolean);
    const index = panels.filter(p => !p.groupId).indexOf(panel);
    const filteredItems = items.filter(i => tabIds.indexOf(i.id) === -1);
    return filteredItems[index]?.id;
  }
  return maybeId;
}

export const useTabPanel = createHook<TabPanelOptions, TabPanelHTMLProps>({
  name: "TabPanel",
  compose: [unstable_useId, useDisclosureContent],
  useState: useTabState,
  keys: ["stopId", "tabId"],

  useOptions(options) {
    return { ...options, unstable_setBaseId: undefined };
  },

  useProps(options, { ref: htmlRef, ...htmlProps }) {
    warning(
      Boolean(options.stopId),
      "[reakit/TabPanel]",
      "`TabPanel`'s `stopId` prop is deprecated. Use `tabId` instead.",
      "See https://reakit.io/docs/tab"
    );

    const { id } = options;
    const tabId = getTabId(options);
    const ref = React.useRef<HTMLElement>(null);

    React.useEffect(() => {
      if (!id) return undefined;
      options.registerPanel?.({ id, ref, groupId: tabId });
      return () => {
        options.unregisterPanel?.(id);
      };
    }, [tabId, id, options.registerPanel, options.unregisterPanel]);

    return {
      ref: useForkRef(ref, htmlRef),
      role: "tabpanel",
      tabIndex: 0,
      "aria-labelledby": tabId,
      ...htmlProps
    };
  },

  useComposeOptions(options) {
    const tabId = getTabId(options);
    return {
      visible: tabId ? options.selectedId === tabId : false,
      ...options
    };
  }
});

export const TabPanel = createComponent({
  as: "div",
  useHook: useTabPanel
});
