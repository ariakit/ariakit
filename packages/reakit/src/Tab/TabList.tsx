import { warning } from "reakit-utils/warning";
import { createComponent } from "reakit-system/createComponent";
import { useCreateElement } from "reakit-system/useCreateElement";
import { createHook } from "reakit-system/createHook";
import {
  unstable_IdGroupOptions,
  unstable_IdGroupHTMLProps,
  unstable_useIdGroup
} from "../Id/IdGroup";
import { useTabState, TabStateReturn } from "./TabState";

export type TabListOptions = unstable_IdGroupOptions &
  Pick<Partial<TabStateReturn>, "orientation">;

export type TabListHTMLProps = unstable_IdGroupHTMLProps;

export type TabListProps = TabListOptions & TabListHTMLProps;

export const useTabList = createHook<TabListOptions, TabListHTMLProps>({
  name: "TabList",
  compose: unstable_useIdGroup,
  useState: useTabState,

  useProps(options, htmlProps) {
    return {
      role: "tablist",
      "aria-orientation": options.orientation,
      ...htmlProps
    };
  }
});

export const TabList = createComponent({
  as: "div",
  useHook: useTabList,
  useCreateElement: (type, props, children) => {
    warning(
      !props["aria-label"] && !props["aria-labelledby"],
      "[reakit/TabList]",
      "You should provide either `aria-label` or `aria-labelledby` props.",
      "See https://reakit.io/docs/tab"
    );
    return useCreateElement(type, props, children);
  }
});
