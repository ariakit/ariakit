import { warning } from "reakit-utils/warning";
import { createComponent } from "reakit-system/createComponent";
import { useCreateElement } from "reakit-system/useCreateElement";
import { createHook } from "reakit-system/createHook";
import { BoxOptions, BoxHTMLProps, useBox } from "../Box/Box";
import { useTabState, TabStateReturn } from "./TabState";

export type TabListOptions = BoxOptions &
  Pick<Partial<TabStateReturn>, "orientation">;

export type TabListHTMLProps = BoxHTMLProps;

export type TabListProps = TabListOptions & TabListHTMLProps;

export const useTabList = createHook<TabListOptions, TabListHTMLProps>({
  name: "TabList",
  compose: useBox,
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
      "TabList",
      "You should provide either `aria-label` or `aria-labelledby` props.",
      "See https://reakit.io/docs/tab"
    );
    return useCreateElement(type, props, children);
  }
});
